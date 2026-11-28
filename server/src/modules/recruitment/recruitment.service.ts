import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { MailService } from '../../shared/mail/mail.service.js';
import {
  CandidateRecruitmentStatus,
  InterviewRoundType,
  RoundEvaluationResult,
  RecruitmentDepartment,
  Role,
} from '@prisma/client';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';
import { EvaluateRoundDto } from './dto/evaluate-round.dto.js';
import { UpdateCandidateStatusDto } from './dto/update-candidate-status.dto.js';
import { CandidateFilterDto } from './dto/candidate-filter.dto.js';
import { VerifyCandidateDto } from './dto/verify-candidate.dto.js';

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class RecruitmentService {
  private readonly logger = new Logger(RecruitmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
  ) {}

  async getHrCoordinators() {
    const coordinators = await this.prisma.user.findMany({
      where: {
        role: Role.HR_COORDINATOR,
        isArchived: false,
        employmentStatus: { in: ['ACTIVE', 'ON_NOTICE'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        employee: { select: { jobTitle: true } },
      },
      orderBy: { name: 'asc' },
    });

    return coordinators.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      employeeId: u.employeeId,
      jobTitle: u.employee?.jobTitle || 'HR Coordinator',
    }));
  }

  async getTeamLeaders() {
    const teamLeaders = await this.prisma.user.findMany({
      where: {
        role: 'TEAM_LEADER',
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        employee: {
          select: {
            jobTitle: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return teamLeaders.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      employeeId: u.employeeId,
      jobTitle: u.employee?.jobTitle || 'Team Leader',
    }));
  }

  async getRecruitmentStats(
    visitDate?: string,
    actor?: { id: string; name?: string; role?: string },
    teamLeaderId?: string,
    teamLeaderName?: string,
  ) {
    const where: any = {};
    if (visitDate) {
      const start = new Date(visitDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(visitDate);
      end.setHours(23, 59, 59, 999);
      where.visitDate = { gte: start, lte: end };
    }

    const tlId = (actor?.role === 'TEAM_LEADER' ? actor.id : null) || teamLeaderId;
    const tlName = (actor?.role === 'TEAM_LEADER' ? actor.name : null) || teamLeaderName;

    if (tlId || tlName) {
      const tlOr: any[] = [];
      if (tlId) tlOr.push({ teamLeaderId: tlId });
      if (tlName) {
        tlOr.push({ teamLeaderName: { contains: tlName, mode: 'insensitive' } });
        tlOr.push({ tags: { has: `TL:${tlName}` } });
        tlOr.push({ tags: { has: `TL: ${tlName}` } });
      }
      where.AND = where.AND || [];
      where.AND.push({ OR: tlOr });
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

  async getCandidates(
    filter?: CandidateFilterDto,
    actor?: { id: string; name?: string; role?: string },
  ) {
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

    const tlId = (actor?.role === 'TEAM_LEADER' ? actor.id : null) || filter?.teamLeaderId;
    const tlName = (actor?.role === 'TEAM_LEADER' ? actor.name : null) || filter?.teamLeaderName;

    if (tlId || tlName) {
      const tlOr: any[] = [];
      if (tlId) tlOr.push({ teamLeaderId: tlId });
      if (tlName) {
        tlOr.push({ teamLeaderName: { contains: tlName, mode: 'insensitive' } });
        tlOr.push({ tags: { has: `TL:${tlName}` } });
        tlOr.push({ tags: { has: `TL: ${tlName}` } });
      }
      where.AND = where.AND || [];
      where.AND.push({ OR: tlOr });
    }

    if (filter?.search) {
      const searchOr = [
        { fullName: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
        { appliedRole: { contains: filter.search, mode: 'insensitive' } },
        { phone: { contains: filter.search, mode: 'insensitive' } },
        { teamLeaderName: { contains: filter.search, mode: 'insensitive' } },
      ];
      where.AND = where.AND || [];
      where.AND.push({ OR: searchOr });
    }

    const list = await this.prisma.candidate.findMany({
      where,
      include: {
        evaluations: {
          orderBy: { evaluatedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (actor?.role === 'TEAM_LEADER') {
      return list.map(({ confidentialNotes: _hidden, ...rest }) => rest);
    }
    return list;
  }

  async getCandidateById(id: string, actor?: { role?: string }) {
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
    if (actor?.role === 'TEAM_LEADER') {
      const { confidentialNotes: _hidden, ...rest } = candidate;
      return rest;
    }
    return candidate;
  }

  async createCandidate(
    dto: CreateCandidateDto,
    actorUserId?: string,
    meta?: RequestMeta,
    source: 'HR_PORTAL' | 'QR_WALKIN' = 'HR_PORTAL',
  ) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const trimmedPhone = dto.phone.trim();
    const phoneDigits = trimmedPhone.replace(/\D/g, '');
    const last10Digits = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits;

    // 1. Ensure email & mobile number are unique across Candidates
    const existingCandidates = await this.prisma.candidate.findMany({
      where: {
        OR: [
          { email: { equals: normalizedEmail, mode: 'insensitive' } },
          { phone: trimmedPhone },
          ...(last10Digits.length === 10 ? [{ phone: { endsWith: last10Digits } }] : []),
        ],
      },
      select: { id: true, email: true, phone: true },
    });

    for (const c of existingCandidates) {
      if (c.email.toLowerCase() === normalizedEmail) {
        throw new ConflictException('A candidate with this email address is already registered.');
      }
      const cDigits = c.phone.replace(/\D/g, '');
      const cLast10 = cDigits.length >= 10 ? cDigits.slice(-10) : cDigits;
      if (c.phone === trimmedPhone || (last10Digits && cLast10 === last10Digits)) {
        throw new ConflictException('A candidate with this mobile number is already registered.');
      }
    }

    // 2. Ensure email & mobile number do not collide with existing Employees/Users
    const existingUsers = await this.prisma.user.findMany({
      where: {
        isArchived: false,
        OR: [
          { email: { equals: normalizedEmail, mode: 'insensitive' } },
          { phone: trimmedPhone },
          ...(last10Digits.length === 10 ? [{ phone: { endsWith: last10Digits } }] : []),
        ],
      },
      select: { email: true, phone: true },
    });

    for (const u of existingUsers) {
      if (u.email.toLowerCase() === normalizedEmail) {
        throw new ConflictException('This email address is already registered with an employee.');
      }
      if (u.phone) {
        const uDigits = u.phone.replace(/\D/g, '');
        const uLast10 = uDigits.length >= 10 ? uDigits.slice(-10) : uDigits;
        if (u.phone === trimmedPhone || (last10Digits && uLast10 === last10Digits)) {
          throw new ConflictException('This mobile number is already registered with an employee.');
        }
      }
    }

    const visitDate = dto.visitDate ? new Date(dto.visitDate) : new Date();

    let finalTeamLeaderId = dto.teamLeaderId;
    let finalTeamLeaderName = dto.teamLeaderName;

    // Check tags if teamLeaderName was not directly passed
    if (!finalTeamLeaderName && dto.tags && Array.isArray(dto.tags)) {
      const tagTl = dto.tags.find((t) => t.startsWith('TL:'))?.replace('TL:', '').trim();
      if (tagTl) finalTeamLeaderName = tagTl;
    }

    if (finalTeamLeaderId && !finalTeamLeaderName) {
      const tl = await this.prisma.user.findUnique({
        where: { id: finalTeamLeaderId },
        select: { name: true },
      });
      if (tl) finalTeamLeaderName = tl.name;
    } else if (!finalTeamLeaderId && finalTeamLeaderName) {
      const tl = await this.prisma.user.findFirst({
        where: { name: { contains: finalTeamLeaderName.trim(), mode: 'insensitive' }, role: 'TEAM_LEADER' },
        select: { id: true, name: true },
      });
      if (tl) {
        finalTeamLeaderId = tl.id;
        finalTeamLeaderName = tl.name;
      }
    }

    const created = await this.prisma.candidate.create({
      data: {
        fullName: dto.fullName.trim(),
        email: normalizedEmail,
        phone: trimmedPhone,
        department: dto.department,
        appliedRole:
          dto.appliedRole?.trim() ||
          (dto.department === RecruitmentDepartment.DIGITAL
            ? 'Digital Marketing'
            : 'Sales Executive'),
        visitDate,
        experienceYears: dto.experienceYears ?? 0,
        currentCompany: dto.currentCompany,
        expectedSalary: dto.expectedSalary,
        tags: dto.tags ?? [],
        teamLeaderId: finalTeamLeaderId,
        teamLeaderName: finalTeamLeaderName,
        registrationSource: source,
        status: CandidateRecruitmentStatus.REGISTERED,
      },
      include: {
        evaluations: true,
      },
    });

    // Separated System Audit Log
    const actor = actorUserId || (await this.resolveFallbackActorId());
    if (actor) {
      await this.auditService.log({
        actorUserId: actor,
        actionType: source === 'QR_WALKIN' ? 'CANDIDATE_WALKIN_REGISTERED' : 'CANDIDATE_REGISTERED',
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
          teamLeaderId: created.teamLeaderId,
          teamLeaderName: created.teamLeaderName,
          registrationSource: source,
        },
      });
    }

    if (source === 'QR_WALKIN') {
      await this.notificationsService.notifyRoles(
        [Role.HR_ADMIN, Role.HR_COORDINATOR, Role.SUPER_ADMIN],
        {
          title: 'New Walk-In Candidate Registered',
          message: `${created.fullName} scanned the Walk-In QR form for ${created.appliedRole} (${created.department}). Ready for HR verification & Team Lead assignment.`,
          type: 'RECRUITMENT_WALKIN',
          link: '/recruitment',
        },
      );
    }

    return created;
  }

  async verifyAndForwardCandidate(
    candidateId: string,
    dto: VerifyCandidateDto,
    actor: { id: string; name?: string },
    meta?: RequestMeta,
  ) {
    const existing = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });
    if (!existing) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found.`);
    }

    let finalTeamLeaderId = dto.teamLeaderId !== undefined ? dto.teamLeaderId || null : existing.teamLeaderId;
    let finalTeamLeaderName =
      dto.teamLeaderName !== undefined ? dto.teamLeaderName || null : existing.teamLeaderName;

    if (finalTeamLeaderId) {
      const tl = await this.prisma.user.findUnique({
        where: { id: finalTeamLeaderId },
        select: { name: true },
      });
      if (tl) finalTeamLeaderName = tl.name;
    }

    const shouldForwardToHr =
      Boolean(dto.proceedToHr) && existing.status === CandidateRecruitmentStatus.REGISTERED;

    const updated = await this.prisma.candidate.update({
      where: { id: candidateId },
      data: {
        department: dto.department ?? existing.department,
        appliedRole: dto.appliedRole?.trim() || existing.appliedRole,
        expectedSalary:
          dto.expectedSalary !== undefined ? dto.expectedSalary.trim() || null : existing.expectedSalary,
        teamLeaderId: finalTeamLeaderId,
        teamLeaderName: finalTeamLeaderName,
        confidentialNotes:
          dto.confidentialNotes !== undefined
            ? dto.confidentialNotes.trim() || null
            : existing.confidentialNotes,
        hrVerifiedBy: actor.name || 'HR Admin',
        hrVerifiedAt: new Date(),
        ...(shouldForwardToHr ? { status: CandidateRecruitmentStatus.HR_ROUND } : {}),
      },
      include: {
        evaluations: {
          orderBy: { evaluatedAt: 'desc' },
        },
      },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      actionType: shouldForwardToHr ? 'CANDIDATE_FORWARDED_TO_HR' : 'CANDIDATE_HR_VERIFIED',
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      oldValuePayload: {
        candidateId,
        status: existing.status,
        teamLeaderId: existing.teamLeaderId,
        teamLeaderName: existing.teamLeaderName,
        department: existing.department,
      },
      newValuePayload: {
        candidateId,
        candidateName: updated.fullName,
        status: updated.status,
        teamLeaderId: updated.teamLeaderId,
        teamLeaderName: updated.teamLeaderName,
        department: updated.department,
        hrVerifiedBy: updated.hrVerifiedBy,
        hasConfidentialNotes: Boolean(updated.confidentialNotes),
      },
    });

    if (shouldForwardToHr) {
      await this.notificationsService.notifyRoles(
        [Role.HR_COORDINATOR, Role.HR_ADMIN, Role.SUPER_ADMIN],
        {
          title: 'Candidate Ready for HR Round',
          message: `${updated.fullName} (${updated.appliedRole}) has been verified by ${actor.name || 'HR'} and moved to HR Round.`,
          type: 'RECRUITMENT_HR',
          link: '/recruitment',
        },
      );
      if (updated.teamLeaderId) {
        await this.notificationsService.notifyUser(updated.teamLeaderId, {
          title: 'Candidate Assigned to You (HR Round)',
          message: `${updated.fullName} (${updated.appliedRole}) has been assigned to you and moved to HR Round.`,
          type: 'RECRUITMENT_HR',
          link: '/recruitment',
        });
      }
    }

    return updated;
  }

  async evaluateRound(
    candidateId: string,
    dto: EvaluateRoundDto,
    actorUserId?: string,
    meta?: RequestMeta,
  ) {
    const candidate = await this.getCandidateById(candidateId);

    // 1. Guard against re-evaluating already finalized candidates
    if (
      candidate.status === CandidateRecruitmentStatus.SELECTED ||
      candidate.status === CandidateRecruitmentStatus.REJECTED_HR ||
      candidate.status === CandidateRecruitmentStatus.REJECTED_MR
    ) {
      throw new BadRequestException(
        `Candidate has already received a final decision (${candidate.status}) and cannot be evaluated further.`
      );
    }

    // 2. Non-reversible: Cannot go back to HR Round if candidate has already progressed to MR Round
    if (
      dto.round === InterviewRoundType.HR_ROUND &&
      candidate.status === CandidateRecruitmentStatus.MR_ROUND
    ) {
      throw new BadRequestException(
        'Candidate has already cleared Round 1 (HR Round) and progressed to MR Round. They cannot be returned to HR Round.'
      );
    }

    // 3. Sequential: Cannot jump straight to MR Round if HR Round is pending
    if (
      dto.round === InterviewRoundType.MR_ROUND &&
      candidate.status === CandidateRecruitmentStatus.REGISTERED
    ) {
      throw new BadRequestException(
        'Candidate must first be evaluated and clear Round 1 (HR Round) before Round 2 (MR Round).'
      );
    }

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
      updateData.hrCoordinatorId = dto.hrCoordinatorId || null;
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

    // Separated System Audit Logs per round & outcome
    const actionType =
      dto.round === InterviewRoundType.HR_ROUND
        ? dto.result === RoundEvaluationResult.PASSED
          ? 'CANDIDATE_HR_ROUND_PASSED'
          : 'CANDIDATE_HR_ROUND_REJECTED'
        : dto.result === RoundEvaluationResult.PASSED
          ? 'CANDIDATE_MR_ROUND_PASSED'
          : 'CANDIDATE_MR_ROUND_REJECTED';

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
          hrCoordinatorId: dto.hrCoordinatorId || null,
          rating: dto.rating,
          feedback: dto.feedback,
          rejectionReason: dto.result === RoundEvaluationResult.REJECTED ? dto.rejectionReason : null,
        },
      });
    }

    // Dispatch role-targeted in-app notifications (no internal emails)
    if (dto.round === InterviewRoundType.HR_ROUND) {
      if (dto.result === RoundEvaluationResult.PASSED) {
        await this.notificationsService.notifyRoles(
          [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_COORDINATOR],
          {
            title: 'Candidate Cleared HR Round — MR Round Ready',
            message: `${updatedCandidate.fullName} (${updatedCandidate.appliedRole}) passed HR Round (${dto.interviewerName}, ${dto.rating}/5). Moved to MR Round.`,
            type: 'RECRUITMENT_MR_PENDING',
            link: '/recruitment',
          },
        );

        if (updatedCandidate.teamLeaderId) {
          await this.notificationsService.notifyUser(updatedCandidate.teamLeaderId, {
            title: 'MR Round Ready — Assigned Candidate Cleared HR',
            message: `${updatedCandidate.fullName} (${updatedCandidate.appliedRole}) passed HR Round (${dto.interviewerName}, ${dto.rating}/5). Please conduct & evaluate the MR Round.`,
            type: 'RECRUITMENT_MR_PENDING',
            link: '/recruitment',
          });
        } else {
          await this.notificationsService.notifyRoles([Role.TEAM_LEADER], {
            title: 'MR Round Ready — Candidate Cleared HR',
            message: `${updatedCandidate.fullName} (${updatedCandidate.appliedRole}) passed HR Round (${dto.interviewerName}, ${dto.rating}/5). Ready for MR Round evaluation.`,
            type: 'RECRUITMENT_MR_PENDING',
            link: '/recruitment',
          });
        }
      } else {
        await this.notificationsService.notifyRoles(
          [Role.HR_ADMIN, Role.HR_COORDINATOR, Role.SUPER_ADMIN],
          {
            title: 'Candidate Rejected in HR Round',
            message: `${updatedCandidate.fullName} (${updatedCandidate.appliedRole}) was rejected in HR Round by ${dto.interviewerName}. Reason: ${dto.rejectionReason}`,
            type: 'RECRUITMENT_HR_REJECTED',
            link: '/recruitment',
          },
        );
        if (updatedCandidate.teamLeaderId) {
          await this.notificationsService.notifyUser(updatedCandidate.teamLeaderId, {
            title: 'Assigned Candidate Rejected (HR Round)',
            message: `${updatedCandidate.fullName} was rejected in HR Round.`,
            type: 'RECRUITMENT_HR_REJECTED',
            link: '/recruitment',
          });
        }
      }
    } else {
      // MR_ROUND evaluated -> notify HR_ADMIN, HR_COORDINATOR, SUPER_ADMIN, and assigned TEAM_LEADER
      const isSelected = dto.result === RoundEvaluationResult.PASSED;
      const decisionLabel = isSelected ? 'SELECTED' : 'REJECTED';
      await this.notificationsService.notifyRoles(
        [Role.HR_ADMIN, Role.HR_COORDINATOR, Role.SUPER_ADMIN],
        {
          title: `MR Round Result: ${updatedCandidate.fullName} ${decisionLabel}`,
          message: isSelected
            ? `${updatedCandidate.fullName} (${updatedCandidate.appliedRole}) has been SELECTED in MR Round by ${dto.interviewerName}. Ready for Official Offer Letter.`
            : `${updatedCandidate.fullName} (${updatedCandidate.appliedRole}) was REJECTED in MR Round by ${dto.interviewerName}. Reason: ${dto.rejectionReason}`,
          type: isSelected ? 'RECRUITMENT_SELECTED' : 'RECRUITMENT_MR_REJECTED',
          link: '/recruitment',
        },
      );
      if (updatedCandidate.teamLeaderId) {
        await this.notificationsService.notifyUser(updatedCandidate.teamLeaderId, {
          title: `MR Round ${decisionLabel}: ${updatedCandidate.fullName}`,
          message: `${updatedCandidate.fullName} (${updatedCandidate.appliedRole}) was ${decisionLabel} in MR Round by ${dto.interviewerName}.`,
          type: isSelected ? 'RECRUITMENT_SELECTED' : 'RECRUITMENT_MR_REJECTED',
          link: '/recruitment',
        });
      }
    }

    if (dto.result === RoundEvaluationResult.REJECTED) {
      const stageLabel =
        dto.round === InterviewRoundType.HR_ROUND ? 'HR Interview Round' : 'MR Interview Round';
      await this.sendRejectionEmail(
        updatedCandidate,
        stageLabel,
        dto.rejectionReason,
        actor,
        meta,
      );
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

    if (
      (dto.status === CandidateRecruitmentStatus.REJECTED_HR ||
        dto.status === CandidateRecruitmentStatus.REJECTED_MR) &&
      candidate.status !== dto.status
    ) {
      const stageLabel =
        dto.status === CandidateRecruitmentStatus.REJECTED_HR
          ? 'HR Interview Round'
          : 'MR Interview Round';
      await this.sendRejectionEmail(
        updated,
        stageLabel,
        dto.rejectionReason ?? undefined,
        actor,
        meta,
      );
    }

    return updated;
  }

  private async sendRejectionEmail(
    candidate: { id: string; fullName: string; email: string; appliedRole: string },
    stageLabel: string,
    rejectionReason?: string,
    actorUserId?: string,
    meta?: RequestMeta,
  ) {
    if (!candidate.email || !this.mailService.isConfigured()) {
      return;
    }

    const isMrRound = stageLabel.toLowerCase().includes('mr');
    const subject = isMrRound
      ? `Application Update (Management Round): ${candidate.appliedRole} — Mark Anthony Ventures`
      : `Application Update (HR Round): ${candidate.appliedRole} — Mark Anthony Ventures`;

    const text = isMrRound
      ? `Dear ${candidate.fullName},

Thank you for clearing the initial stage and taking the time to participate in the Management Round (MR Round) interview with Mark Anthony Ventures for the position of ${candidate.appliedRole}.

After careful review of your Management Round evaluation, we regret to inform you that we will not be moving forward with your candidature at this stage.

We truly appreciate the time and effort you invested in our selection process and wish you every success in your future career endeavors.

Best regards,
Shilpa Kumari.P
Head of Human Resource /Finance
Mark Anthony Ventures`
      : `Dear ${candidate.fullName},

Thank you for taking the time to attend the HR Round interview with Mark Anthony Ventures for the position of ${candidate.appliedRole}.

After careful consideration of your profile and HR Round discussion, we regret to inform you that we will not be moving forward to the next round at this time.

We appreciate your interest in Mark Anthony Ventures and wish you every success in your future career endeavors.

Best regards,
Shilpa Kumari.P
Head of Human Resource /Finance
Mark Anthony Ventures`;

    const paragraphs = text.split('\n\n');
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; margin: 0; padding: 12px 0;">
  ${paragraphs
    .map(
      (p) =>
        `<p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">${p.replace(/\n/g, '<br>')}</p>`,
    )
    .join('\n')}
</body>
</html>`.trim();

    try {
      const result = await this.mailService.sendMail({
        to: candidate.email,
        subject,
        text,
        html,
      });

      const actor = actorUserId || (await this.resolveFallbackActorId());
      if (actor) {
        await this.auditService.log({
          actorUserId: actor,
          actionType: 'CANDIDATE_REJECTION_EMAILED',
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
          newValuePayload: {
            candidateId: candidate.id,
            candidateName: candidate.fullName,
            recipientEmail: candidate.email,
            stage: stageLabel,
            rejectionReason: rejectionReason || null,
            subject,
            messageId: result.messageId,
            sentAt: new Date().toISOString(),
          },
        });
      }
    } catch (err) {
      this.logger.error(
        `Failed to send rejection email to ${candidate.email}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private async resolveFallbackActorId(): Promise<string | undefined> {
    const user = await this.prisma.user.findFirst({
      where: { role: { in: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_COORDINATOR'] } },
      select: { id: true },
    });
    return user?.id;
  }
}
