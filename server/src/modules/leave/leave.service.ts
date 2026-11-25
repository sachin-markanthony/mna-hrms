import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApprovalDecision,
  AttendanceStatus,
  LeaveStatus,
  LeaveType,
  Prisma,
} from '@prisma/client';
import { AppRole } from '../../core/decorators/roles.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import type { ApplyLeaveDto } from './dto/apply-leave.dto.js';
import type { InitializeBalancesDto } from './dto/initialize-balances.dto.js';
import type { LeaveDecisionDto } from './dto/leave-decision.dto.js';
import type { QueryLeaveDto } from './dto/query-leave.dto.js';

const DEFAULT_ALLOCATIONS: Record<LeaveType, number> = {
  [LeaveType.CASUAL]: 12,
  [LeaveType.SICK]: 8,
  [LeaveType.EARNED]: 15,
  [LeaveType.LOP]: 0,
};

const LEAVE_REQUEST_INCLUDE = {
  user: {
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      teamId: true,
      team: { select: { id: true, name: true } },
      employee: {
        select: {
          jobTitle: true,
          department: { select: { id: true, name: true } },
        },
      },
    },
  },
  teamLeadApprovedBy: { select: { id: true, name: true, email: true } },
  hrApprovedBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.LeaveRequestInclude;

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getMyBalances(userId: string, year = new Date().getUTCFullYear()) {
    await this.ensureUserBalances(userId, year);
    return this.prisma.leaveBalance.findMany({
      where: { userId, year },
      orderBy: { leaveType: 'asc' },
    });
  }

  async initializeBalances(
    dto: InitializeBalancesDto,
    actorUserId: string,
    meta: RequestMeta,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('Employee not found');
    }

    const entries: Array<{ leaveType: LeaveType; allocatedDays: number }> = [
      { leaveType: LeaveType.CASUAL, allocatedDays: dto.casual },
      { leaveType: LeaveType.SICK, allocatedDays: dto.sick },
      { leaveType: LeaveType.EARNED, allocatedDays: dto.earned },
      { leaveType: LeaveType.LOP, allocatedDays: 0 },
    ];

    const results = await this.prisma.$transaction(async (tx) => {
      const updated = [];
      for (const entry of entries) {
        const existing = await tx.leaveBalance.findUnique({
          where: {
            userId_leaveType_year: {
              userId: dto.userId,
              leaveType: entry.leaveType,
              year: dto.year,
            },
          },
        });

        const usedDays = existing?.usedDays ?? 0;
        const remainingDays =
          entry.leaveType === LeaveType.LOP
            ? 0
            : Math.max(0, entry.allocatedDays - usedDays);

        const row = await tx.leaveBalance.upsert({
          where: {
            userId_leaveType_year: {
              userId: dto.userId,
              leaveType: entry.leaveType,
              year: dto.year,
            },
          },
          update: {
            allocatedDays: entry.allocatedDays,
            remainingDays,
          },
          create: {
            userId: dto.userId,
            leaveType: entry.leaveType,
            year: dto.year,
            allocatedDays: entry.allocatedDays,
            usedDays: 0,
            remainingDays,
          },
        });
        updated.push(row);
      }
      return updated;
    });

    await this.auditService.log({
      actorUserId,
      targetUserId: dto.userId,
      actionType: 'LEAVE_BALANCES_UPDATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: { year: dto.year, casual: dto.casual, sick: dto.sick, earned: dto.earned },
    });

    return results;
  }

  /**
   * Visibility rules:
   * - SUPER_ADMIN, HR_ADMIN & HR_COORDINATOR: see all employee leave requests across the company
   * - TEAM_LEADER: see requests of employees in their team + their own
   * - EMPLOYEE: see only their own requests
   */
  async getVisibleRequests(currentUser: AuthenticatedUser, query: QueryLeaveDto) {
    const scopeWhere = await this.buildVisibilityWhere(currentUser);
    const where: Prisma.LeaveRequestWhereInput = {
      ...scopeWhere,
      ...(query.status ? { status: query.status } : {}),
      ...(query.leaveType ? { leaveType: query.leaveType } : {}),
      ...(query.year
        ? {
            startDate: {
              gte: new Date(Date.UTC(query.year, 0, 1)),
              lte: new Date(Date.UTC(query.year, 11, 31)),
            },
          }
        : {}),
    };

    return this.prisma.leaveRequest.findMany({
      where,
      include: LEAVE_REQUEST_INCLUDE,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getTeamCalendar(currentUser: AuthenticatedUser, month?: number, year?: number) {
    const now = new Date();
    const targetYear = year ?? now.getUTCFullYear();
    const targetMonth = month ?? now.getUTCMonth() + 1;

    const monthStart = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
    const monthEnd = new Date(Date.UTC(targetYear, targetMonth, 0));

    const scopeWhere = await this.buildCalendarVisibilityWhere(currentUser);

    return this.prisma.leaveRequest.findMany({
      where: {
        ...scopeWhere,
        status: { in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
      include: LEAVE_REQUEST_INCLUDE,
      orderBy: { startDate: 'asc' },
    });
  }

  async applyLeave(currentUser: AuthenticatedUser, dto: ApplyLeaveDto, meta: RequestMeta) {
    const start = this.parseUtcDate(dto.startDate);
    const end = this.parseUtcDate(dto.endDate);

    if (end < start) {
      throw new BadRequestException('End date cannot be before start date');
    }

    const totalDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    const year = start.getUTCFullYear();

    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        userId: currentUser.id,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
      select: { id: true },
    });

    if (overlapping) {
      throw new ConflictException('You already have a pending or approved leave on these dates');
    }

    await this.ensureUserBalances(currentUser.id, year);

    if (dto.leaveType !== LeaveType.LOP) {
      const balance = await this.prisma.leaveBalance.findUnique({
        where: {
          userId_leaveType_year: {
            userId: currentUser.id,
            leaveType: dto.leaveType,
            year,
          },
        },
      });

      if (!balance || balance.remainingDays < totalDays) {
        throw new BadRequestException(
          `Insufficient ${dto.leaveType} leave balance. Available: ${balance?.remainingDays ?? 0} day(s), requested: ${totalDays} day(s)`,
        );
      }
    }

    const created = await this.prisma.leaveRequest.create({
      data: {
        userId: currentUser.id,
        leaveType: dto.leaveType,
        startDate: start,
        endDate: end,
        totalDays,
        reason: dto.reason.trim(),
        status: LeaveStatus.PENDING,
        teamLeadStatus: ApprovalDecision.PENDING,
        hrStatus: ApprovalDecision.PENDING,
      },
      include: LEAVE_REQUEST_INCLUDE,
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      targetUserId: currentUser.id,
      actionType: 'LEAVE_APPLIED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        leaveRequestId: created.id,
        leaveType: created.leaveType,
        startDate: dto.startDate,
        endDate: dto.endDate,
        totalDays,
      },
    });

    return created;
  }

  async submitTeamLeadDecision(
    requestId: string,
    currentUser: AuthenticatedUser,
    dto: LeaveDecisionDto,
    meta: RequestMeta,
  ) {
    if (
      currentUser.role !== AppRole.TEAM_LEADER &&
      currentUser.role !== AppRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Only Team Lead or SuperAdmin can submit Team Lead approval');
    }

    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: { user: { select: { id: true, teamId: true } } },
    });

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.userId === currentUser.id && currentUser.role !== AppRole.SUPER_ADMIN) {
      throw new ForbiddenException('You cannot approve or reject your own leave request');
    }

    if (currentUser.role !== AppRole.SUPER_ADMIN) {
      const actor = await this.prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { teamId: true },
      });
      if (!actor?.teamId || actor.teamId !== request.user.teamId) {
        throw new ForbiddenException('You can only approve leave requests for members of your own team');
      }
    }

    return this.applyStageDecision(request.id, 'TEAM_LEAD', currentUser.id, dto, meta);
  }

  async submitHrDecision(
    requestId: string,
    currentUser: AuthenticatedUser,
    dto: LeaveDecisionDto,
    meta: RequestMeta,
  ) {
    if (
      currentUser.role !== AppRole.HR_ADMIN &&
      currentUser.role !== AppRole.HR_COORDINATOR &&
      currentUser.role !== AppRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Only HR Admin, HR Coordinator, or SuperAdmin can submit HR approval');
    }

    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.userId === currentUser.id && currentUser.role !== AppRole.SUPER_ADMIN) {
      throw new ForbiddenException('You cannot submit HR approval for your own leave request');
    }

    return this.applyStageDecision(request.id, 'HR', currentUser.id, dto, meta);
  }

  async cancelLeave(requestId: string, currentUser: AuthenticatedUser, meta: RequestMeta) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.userId !== currentUser.id && currentUser.role !== AppRole.SUPER_ADMIN) {
      throw new ForbiddenException('You can only cancel your own leave request');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending leave requests can be cancelled');
    }

    const updated = await this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status: LeaveStatus.CANCELLED },
      include: LEAVE_REQUEST_INCLUDE,
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      targetUserId: request.userId,
      actionType: 'LEAVE_CANCELLED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: { leaveRequestId: requestId },
    });

    return updated;
  }

  private async applyStageDecision(
    requestId: string,
    stage: 'TEAM_LEAD' | 'HR',
    actorUserId: string,
    dto: LeaveDecisionDto,
    meta: RequestMeta,
  ) {
    const decisionEnum =
      dto.decision === 'APPROVED' ? ApprovalDecision.APPROVED : ApprovalDecision.REJECTED;

    const result = await this.prisma.$transaction(async (tx) => {
      const current = await tx.leaveRequest.findUnique({
        where: { id: requestId },
      });

      if (!current) {
        throw new NotFoundException('Leave request not found');
      }

      if (current.status !== LeaveStatus.PENDING) {
        throw new BadRequestException(`Leave request is already ${current.status}`);
      }

      const nextTeamLeadStatus =
        stage === 'TEAM_LEAD' ? decisionEnum : current.teamLeadStatus;
      const nextHrStatus = stage === 'HR' ? decisionEnum : current.hrStatus;

      let nextOverallStatus: LeaveStatus = LeaveStatus.PENDING;
      if (decisionEnum === ApprovalDecision.REJECTED) {
        nextOverallStatus = LeaveStatus.REJECTED;
      } else if (
        nextTeamLeadStatus === ApprovalDecision.APPROVED &&
        nextHrStatus === ApprovalDecision.APPROVED
      ) {
        nextOverallStatus = LeaveStatus.APPROVED;
      }

      if (nextOverallStatus === LeaveStatus.APPROVED) {
        const year = current.startDate.getUTCFullYear();
        const balance = await tx.leaveBalance.findUnique({
          where: {
            userId_leaveType_year: {
              userId: current.userId,
              leaveType: current.leaveType,
              year,
            },
          },
        });

        if (current.leaveType !== LeaveType.LOP) {
          if (!balance || balance.remainingDays < current.totalDays) {
            throw new BadRequestException(
              `Cannot finalize approval: insufficient ${current.leaveType} balance remaining`,
            );
          }
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              usedDays: { increment: current.totalDays },
              remainingDays: { decrement: current.totalDays },
            },
          });
        } else if (balance) {
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              usedDays: { increment: current.totalDays },
            },
          });
        }

        // Sync every approved leave date into attendance_master
        const attendanceStatus =
          current.leaveType === LeaveType.LOP
            ? AttendanceStatus.LOP
            : AttendanceStatus.ON_LEAVE;

        const cursor = new Date(current.startDate);
        while (cursor <= current.endDate) {
          const day = new Date(cursor);
          await tx.attendanceMaster.upsert({
            where: {
              userId_attendanceDate: {
                userId: current.userId,
                attendanceDate: day,
              },
            },
            update: {
              status: attendanceStatus,
              remarks: `Approved ${current.leaveType} leave`,
            },
            create: {
              userId: current.userId,
              attendanceDate: day,
              status: attendanceStatus,
              remarks: `Approved ${current.leaveType} leave`,
            },
          });
          cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
      }

      const stageUpdate: Prisma.LeaveRequestUpdateInput =
        stage === 'TEAM_LEAD'
          ? {
              teamLeadStatus: decisionEnum,
              teamLeadApprovedBy: { connect: { id: actorUserId } },
              teamLeadApprovedAt: new Date(),
              teamLeadRemarks: dto.remarks?.trim() ?? null,
              status: nextOverallStatus,
            }
          : {
              hrStatus: decisionEnum,
              hrApprovedBy: { connect: { id: actorUserId } },
              hrApprovedAt: new Date(),
              hrRemarks: dto.remarks?.trim() ?? null,
              status: nextOverallStatus,
            };

      return tx.leaveRequest.update({
        where: { id: requestId },
        data: stageUpdate,
        include: LEAVE_REQUEST_INCLUDE,
      });
    });

    let actionType = `LEAVE_${stage}_APPROVED`;
    if (result.status === LeaveStatus.REJECTED) {
      actionType = `LEAVE_${stage}_REJECTED`;
    } else if (result.status === LeaveStatus.APPROVED) {
      actionType = 'LEAVE_APPROVED_FINAL';
    }

    await this.auditService.log({
      actorUserId,
      targetUserId: result.userId,
      actionType,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        leaveRequestId: result.id,
        stage,
        decision: dto.decision,
        finalStatus: result.status,
        remarks: dto.remarks ?? null,
      },
    });

    return result;
  }

  private async ensureUserBalances(userId: string, year: number) {
    const existing = await this.prisma.leaveBalance.findMany({
      where: { userId, year },
      select: { leaveType: true },
    });
    const existingTypes = new Set(existing.map((b) => b.leaveType));

    const missing = (Object.keys(DEFAULT_ALLOCATIONS) as LeaveType[]).filter(
      (lt) => !existingTypes.has(lt),
    );

    if (missing.length > 0) {
      await this.prisma.leaveBalance.createMany({
        data: missing.map((leaveType) => ({
          userId,
          leaveType,
          year,
          allocatedDays: DEFAULT_ALLOCATIONS[leaveType],
          usedDays: 0,
          remainingDays: DEFAULT_ALLOCATIONS[leaveType],
        })),
        skipDuplicates: true,
      });
    }
  }

  private async buildVisibilityWhere(
    currentUser: AuthenticatedUser,
  ): Promise<Prisma.LeaveRequestWhereInput> {
    if (
      currentUser.role === AppRole.SUPER_ADMIN ||
      currentUser.role === AppRole.HR_ADMIN ||
      currentUser.role === AppRole.HR_COORDINATOR
    ) {
      return {};
    }

    if (currentUser.role === AppRole.TEAM_LEADER) {
      const actor = await this.prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { teamId: true },
      });

      if (actor?.teamId) {
        return {
          OR: [{ userId: currentUser.id }, { user: { teamId: actor.teamId } }],
        };
      }
    }

    return { userId: currentUser.id };
  }

  private async buildCalendarVisibilityWhere(
    currentUser: AuthenticatedUser,
  ): Promise<Prisma.LeaveRequestWhereInput> {
    if (
      currentUser.role === AppRole.SUPER_ADMIN ||
      currentUser.role === AppRole.HR_ADMIN ||
      currentUser.role === AppRole.HR_COORDINATOR
    ) {
      return {};
    }

    const actor = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { teamId: true },
    });

    if (actor?.teamId) {
      return {
        OR: [{ userId: currentUser.id }, { user: { teamId: actor.teamId } }],
      };
    }

    return { userId: currentUser.id };
  }

  private parseUtcDate(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date format: ${value}`);
    }
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }
}
