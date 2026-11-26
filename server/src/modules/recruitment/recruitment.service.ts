import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import {
  CandidateRecruitmentStatus,
  InterviewRoundType,
  RoundEvaluationResult,
  RecruitmentDepartment,
} from '@prisma/client';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';
import { EvaluateRoundDto } from './dto/evaluate-round.dto.js';
import { UpdateCandidateStatusDto } from './dto/update-candidate-status.dto.js';
import { CandidateFilterDto } from './dto/candidate-filter.dto.js';

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class RecruitmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getRecruitmentStats(visitDate?: string) {
    const where: any = {};
    if (visitDate) {
      const start = new Date(visitDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(visitDate);
      end.setHours(23, 59, 59, 999);
      where.visitDate = { gte: start, lte: end };
    }

    const [
      totalWalkIns,
      digitalCount,
      salesCount,
      registeredCount,
      hrRoundCount,
      mrRoundCount,
      selectedCount,
      rejectedAtHrCount,
      rejectedAtMrCount,
    ] = await Promise.all([
      this.prisma.candidate.count({ where }),
      this.prisma.candidate.count({ where: { ...where, department: RecruitmentDepartment.DIGITAL } }),
      this.prisma.candidate.count({ where: { ...where, department: RecruitmentDepartment.SALES } }),
      this.prisma.candidate.count({
        where: { ...where, status: CandidateRecruitmentStatus.REGISTERED },
      }),
      this.prisma.candidate.count({
        where: { ...where, status: CandidateRecruitmentStatus.HR_ROUND },
      }),
      this.prisma.candidate.count({
        where: { ...where, status: CandidateRecruitmentStatus.MR_ROUND },
      }),
      this.prisma.candidate.count({
        where: { ...where, status: CandidateRecruitmentStatus.SELECTED },
      }),
      this.prisma.candidate.count({
        where: { ...where, status: CandidateRecruitmentStatus.REJECTED_HR },
      }),
      this.prisma.candidate.count({
        where: { ...where, status: CandidateRecruitmentStatus.REJECTED_MR },
      }),
    ]);

    const totalRejected = rejectedAtHrCount + rejectedAtMrCount;
    const selectionRate =
      totalWalkIns > 0 ? Number(((selectedCount / totalWalkIns) * 100).toFixed(1)) : 0;

    return {
      totalWalkIns,
      departments: {
        digital: digitalCount,
        sales: salesCount,
      },
      stages: {
        registered: registeredCount,
        inHrRound: hrRoundCount,
        inMrRound: mrRoundCount,
        selected: selectedCount,
      },
      rejections: {
        rejectedAtHr: rejectedAtHrCount,
        rejectedAtMr: rejectedAtMrCount,
        totalRejected,
      },
      selectionRate,
      dateFiltered: visitDate ?? 'All-Time',
    };
  }

  async getCandidates(filter?: CandidateFilterDto) {
    const where: any = {};
    if (filter?.department) {
      where.department = filter.department;
    }
    if (filter?.status) {
      where.status = filter.status;
    }
    if (filter?.visitDate) {
      const start = new Date(filter.visitDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filter.visitDate);
      end.setHours(23, 59, 59, 999);
      where.visitDate = { gte: start, lte: end };
    }
    if (filter?.search) {
      where.OR = [
        { fullName: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
        { appliedRole: { contains: filter.search, mode: 'insensitive' } },
        { phone: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.candidate.findMany({
      where,
      include: {
        evaluations: {
          orderBy: { evaluatedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCandidateById(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        evaluations: {
          orderBy: { evaluatedAt: 'desc' },
        },
      },
    });
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found.`);
    }
    return candidate;
  }

  async createCandidate(dto: CreateCandidateDto, actorUserId?: string, meta?: RequestMeta) {
    const visitDate = dto.visitDate ? new Date(dto.visitDate) : new Date();

    const created = await this.prisma.candidate.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        department: dto.department,
        appliedRole: dto.appliedRole,
        visitDate,
        experienceYears: dto.experienceYears ?? 0,
        currentCompany: dto.currentCompany,
        expectedSalary: dto.expectedSalary,
        tags: dto.tags ?? [],
        status: CandidateRecruitmentStatus.REGISTERED,
      },
      include: {
        evaluations: true,
      },
    });

    // Form System Audit Log
    const actor = actorUserId || (await this.resolveFallbackActorId());
    if (actor) {
      await this.auditService.log({
        actorUserId: actor,
        actionType: 'CANDIDATE_REGISTERED',
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
        newValuePayload: {
          candidateId: created.id,
          fullName: created.fullName,
          department: created.department,
          appliedRole: created.appliedRole,
          email: created.email,
          phone: created.phone,
          visitDate: created.visitDate,
          experienceYears: created.experienceYears,
          expectedSalary: created.expectedSalary,
        },
      });
    }

    return created;
  }

  async evaluateRound(
    candidateId: string,
    dto: EvaluateRoundDto,
    actorUserId?: string,
    meta?: RequestMeta,
  ) {
    const candidate = await this.getCandidateById(candidateId);

    if (dto.result === RoundEvaluationResult.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException('A mandatory rejection reason must be provided when rejecting a candidate.');
    }

    let nextStatus: CandidateRecruitmentStatus;
    if (dto.round === InterviewRoundType.HR_ROUND) {
      nextStatus =
        dto.result === RoundEvaluationResult.PASSED
          ? CandidateRecruitmentStatus.MR_ROUND
          : CandidateRecruitmentStatus.REJECTED_HR;
    } else {
      nextStatus =
        dto.result === RoundEvaluationResult.PASSED
          ? CandidateRecruitmentStatus.SELECTED
          : CandidateRecruitmentStatus.REJECTED_MR;
    }

    const evaluation = await this.prisma.roundEvaluation.create({
      data: {
        candidateId,
        round: dto.round,
        result: dto.result,
        interviewerName: dto.interviewerName,
        rating: dto.rating,
        feedback: dto.feedback,
        rejectionReason: dto.result === RoundEvaluationResult.REJECTED ? dto.rejectionReason : null,
      },
    });

    const updateData: any = {
      status: nextStatus,
    };

    if (dto.round === InterviewRoundType.HR_ROUND) {
      updateData.hrInterviewer = dto.interviewerName;
      updateData.hrRating = dto.rating;
      updateData.hrFeedback = dto.feedback;
      updateData.hrEvaluatedAt = new Date();
      if (dto.result === RoundEvaluationResult.REJECTED) {
        updateData.rejectionReason = dto.rejectionReason;
      }
    } else {
      updateData.mrInterviewer = dto.interviewerName;
      updateData.mrRating = dto.rating;
      updateData.mrFeedback = dto.feedback;
      updateData.mrEvaluatedAt = new Date();
      if (dto.result === RoundEvaluationResult.REJECTED) {
        updateData.rejectionReason = dto.rejectionReason;
      }
    }

    const updatedCandidate = await this.prisma.candidate.update({
      where: { id: candidateId },
      data: updateData,
      include: {
        evaluations: {
          orderBy: { evaluatedAt: 'desc' },
        },
      },
    });

    // Form System Audit Log for HR or MR evaluation
    const actionType =
      dto.round === InterviewRoundType.HR_ROUND
        ? 'CANDIDATE_HR_EVALUATED'
        : 'CANDIDATE_MR_EVALUATED';

    const actor = actorUserId || (await this.resolveFallbackActorId());
    if (actor) {
      await this.auditService.log({
        actorUserId: actor,
        actionType,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
        oldValuePayload: {
          candidateId,
          previousStatus: candidate.status,
        },
        newValuePayload: {
          candidateId,
          candidateName: candidate.fullName,
          department: candidate.department,
          round: dto.round,
          result: dto.result,
          newStatus: nextStatus,
          interviewerName: dto.interviewerName,
          rating: dto.rating,
          feedback: dto.feedback,
          rejectionReason: dto.result === RoundEvaluationResult.REJECTED ? dto.rejectionReason : null,
        },
      });
    }

    return {
      candidate: updatedCandidate,
      evaluation,
    };
  }

  async updateStatus(
    candidateId: string,
    dto: UpdateCandidateStatusDto,
    actorUserId?: string,
    meta?: RequestMeta,
  ) {
    const candidate = await this.getCandidateById(candidateId);

    const updated = await this.prisma.candidate.update({
      where: { id: candidateId },
      data: {
        status: dto.status,
        rejectionReason: dto.rejectionReason ?? null,
      },
      include: {
        evaluations: {
          orderBy: { evaluatedAt: 'desc' },
        },
      },
    });

    // Form System Audit Log for status override
    const actor = actorUserId || (await this.resolveFallbackActorId());
    if (actor) {
      await this.auditService.log({
        actorUserId: actor,
        actionType: 'CANDIDATE_STATUS_OVERRIDE',
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
        oldValuePayload: {
          candidateId,
          status: candidate.status,
          rejectionReason: candidate.rejectionReason,
        },
        newValuePayload: {
          candidateId,
          status: dto.status,
          rejectionReason: dto.rejectionReason ?? null,
        },
      });
    }

    return updated;
  }

  private async resolveFallbackActorId(): Promise<string | undefined> {
    const user = await this.prisma.user.findFirst({
      where: { role: { in: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_COORDINATOR'] } },
      select: { id: true },
    });
    return user?.id;
  }
}
