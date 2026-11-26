import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  ApprovalDecision,
  AttendanceStatus,
  EmploymentStatus,
  Prisma,
  PunchDirection,
  PunchSource,
} from '@prisma/client';
import { AppRole } from '../../core/decorators/roles.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { calculateDistanceMeters } from '../../shared/utils/geo.util.js';
import { AuditService } from '../audit/audit.service.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import type { HardwarePunchDto } from './dto/hardware-punch.dto.js';
import type { QueryAttendanceDto } from './dto/query-attendance.dto.js';
import type { RegularizationDecisionDto } from './dto/regularization-decision.dto.js';
import type { RegularizeAttendanceDto } from './dto/regularize-attendance.dto.js';
import type { SitePunchDto } from './dto/site-punch.dto.js';

const MAX_GEOFENCE_METERS = 300;
const FULL_DAY_HOURS = 8.5;
const HALF_DAY_HOURS = 4.0;

const USER_SUMMARY_SELECT = {
  id: true,
  employeeId: true,
  name: true,
  email: true,
  role: true,
  teamId: true,
  team: { select: { id: true, name: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Stream 1: Office Facial Scan Hardware Webhook (Tier 1 Append-Only)
   */
  async recordHardwarePunch(dto: HardwarePunchDto, meta: RequestMeta) {
    if (dto.faceConfidence !== undefined) {
      const normalized = dto.faceConfidence <= 1 ? dto.faceConfidence * 100 : dto.faceConfidence;
      if (normalized < 85) {
        throw new BadRequestException(
          `Facial confidence too low (${normalized.toFixed(1)}%). Minimum 85% required.`,
        );
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { employeeId: dto.employeeId },
      select: { id: true, employeeId: true, isArchived: true, employmentStatus: true },
    });

    if (!user || user.isArchived || user.employmentStatus === EmploymentStatus.ARCHIVED) {
      throw new NotFoundException(`Active employee "${dto.employeeId}" not found`);
    }

    const punchTime = dto.timestamp ? new Date(dto.timestamp) : new Date();

    const rawLog = await this.prisma.attendanceRawLog.create({
      data: {
        userId: user.id,
        source: PunchSource.FACIAL_DEVICE,
        direction: dto.direction,
        rawTimestamp: punchTime,
        deviceIp: dto.deviceIp ?? meta.ipAddress,
        faceConfidence: dto.faceConfidence,
        status: 'VALIDATED',
      },
      include: { user: { select: USER_SUMMARY_SELECT } },
    });

    await this.reconcileUserDay(user.id, this.toUtcDay(punchTime));
    return rawLog;
  }

  /**
   * Stream 2: Field Sales CRM Mobile GPS Site Visit Punch (<= 300m Geofence)
   */
  async recordSiteVisitPunch(currentUser: AuthenticatedUser, dto: SitePunchDto) {
    const distanceMeters = calculateDistanceMeters(
      dto.latitude,
      dto.longitude,
      dto.projectLat,
      dto.projectLng,
    );

    if (distanceMeters > MAX_GEOFENCE_METERS) {
      throw new BadRequestException(
        `Outside project geofence: ${Math.round(distanceMeters)}m away (maximum ${MAX_GEOFENCE_METERS}m allowed).`,
      );
    }

    const now = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      const rawLog = await tx.attendanceRawLog.create({
        data: {
          userId: currentUser.id,
          source: PunchSource.SITE_VISIT_GPS,
          direction: dto.direction,
          rawTimestamp: now,
          latitude: dto.latitude,
          longitude: dto.longitude,
          projectId: dto.projectId,
          status: 'VALIDATED',
        },
      });

      let siteVisit;
      if (dto.direction === PunchDirection.IN) {
        siteVisit = await tx.siteVisit.create({
          data: {
            userId: currentUser.id,
            projectId: dto.projectId,
            projectName: dto.projectName,
            leadId: dto.leadId,
            checkInTime: now,
            checkInLat: dto.latitude,
            checkInLng: dto.longitude,
            distanceMeters: Math.round(distanceMeters),
            notes: dto.notes,
            status: 'VALIDATED',
          },
          include: { user: { select: USER_SUMMARY_SELECT } },
        });
      } else {
        const openVisit = await tx.siteVisit.findFirst({
          where: {
            userId: currentUser.id,
            projectId: dto.projectId,
            checkOutTime: null,
          },
          orderBy: { checkInTime: 'desc' },
        });

        if (openVisit) {
          siteVisit = await tx.siteVisit.update({
            where: { id: openVisit.id },
            data: {
              checkOutTime: now,
              checkOutLat: dto.latitude,
              checkOutLng: dto.longitude,
              notes: dto.notes ?? openVisit.notes,
            },
            include: { user: { select: USER_SUMMARY_SELECT } },
          });
        } else {
          siteVisit = await tx.siteVisit.create({
            data: {
              userId: currentUser.id,
              projectId: dto.projectId,
              projectName: dto.projectName,
              leadId: dto.leadId,
              checkInTime: now,
              checkOutTime: now,
              checkInLat: dto.latitude,
              checkInLng: dto.longitude,
              checkOutLat: dto.latitude,
              checkOutLng: dto.longitude,
              distanceMeters: Math.round(distanceMeters),
              notes: dto.notes,
              status: 'VALIDATED',
            },
            include: { user: { select: USER_SUMMARY_SELECT } },
          });
        }
      }

      return { rawLog, siteVisit };
    });

    await this.reconcileUserDay(currentUser.id, this.toUtcDay(now));
    return result;
  }

  async getRawLogs(currentUser: AuthenticatedUser, query: QueryAttendanceDto) {
    const scopeWhere = await this.buildUserScope(currentUser);
    const dateFilter = this.buildDateRange(query.startDate, query.endDate);

    return this.prisma.attendanceRawLog.findMany({
      where: {
        ...scopeWhere,
        ...(dateFilter ? { rawTimestamp: dateFilter } : {}),
      },
      include: { user: { select: USER_SUMMARY_SELECT } },
      orderBy: { rawTimestamp: 'desc' },
      take: 200,
    });
  }

  async getMasterRecords(currentUser: AuthenticatedUser, query: QueryAttendanceDto) {
    const scopeWhere = await this.buildUserScope(currentUser);
    const dateFilter = this.buildDateRange(query.startDate, query.endDate);

    return this.prisma.attendanceMaster.findMany({
      where: {
        ...scopeWhere,
        ...(query.status ? { status: query.status } : {}),
        ...(dateFilter ? { attendanceDate: dateFilter } : {}),
      },
      include: { user: { select: USER_SUMMARY_SELECT } },
      orderBy: [{ attendanceDate: 'desc' }, { user: { employeeId: 'asc' } }],
      take: 200,
    });
  }

  async getSiteVisits(currentUser: AuthenticatedUser, query: QueryAttendanceDto) {
    const scopeWhere = await this.buildUserScope(currentUser);
    const dateFilter = this.buildDateRange(query.startDate, query.endDate);

    return this.prisma.siteVisit.findMany({
      where: {
        ...scopeWhere,
        ...(dateFilter ? { checkInTime: dateFilter } : {}),
      },
      include: { user: { select: USER_SUMMARY_SELECT } },
      orderBy: { checkInTime: 'desc' },
      take: 100,
    });
  }

  async requestRegularization(
    currentUser: AuthenticatedUser,
    dto: RegularizeAttendanceDto,
    meta: RequestMeta,
  ) {
    const day = this.toUtcDay(new Date(dto.attendanceDate));

    const created = await this.prisma.attendanceRegularization.create({
      data: {
        userId: currentUser.id,
        attendanceDate: day,
        requestedIn: dto.requestedIn ? new Date(dto.requestedIn) : null,
        requestedOut: dto.requestedOut ? new Date(dto.requestedOut) : null,
        reason: dto.reason.trim(),
        status: ApprovalDecision.PENDING,
      },
      include: {
        user: { select: USER_SUMMARY_SELECT },
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      targetUserId: currentUser.id,
      actionType: 'ATTENDANCE_REGULARIZATION_REQUESTED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: { regularizationId: created.id, attendanceDate: dto.attendanceDate },
    });

    return created;
  }

  async getRegularizations(currentUser: AuthenticatedUser) {
    const scopeWhere = await this.buildUserScope(currentUser);
    return this.prisma.attendanceRegularization.findMany({
      where: scopeWhere,
      include: {
        user: { select: USER_SUMMARY_SELECT },
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async decideRegularization(
    id: string,
    currentUser: AuthenticatedUser,
    dto: RegularizationDecisionDto,
    meta: RequestMeta,
  ) {
    if (
      currentUser.role !== AppRole.SUPER_ADMIN &&
      currentUser.role !== AppRole.HR_ADMIN &&
      currentUser.role !== AppRole.HR_COORDINATOR &&
      currentUser.role !== AppRole.TEAM_LEADER
    ) {
      throw new ForbiddenException('Not authorized to review attendance regularizations');
    }

    const reg = await this.prisma.attendanceRegularization.findUnique({
      where: { id },
      include: { user: { select: { id: true, teamId: true } } },
    });

    if (!reg) {
      throw new NotFoundException('Regularization request not found');
    }

    if (reg.status !== ApprovalDecision.PENDING) {
      throw new BadRequestException(`Regularization is already ${reg.status}`);
    }

    if (reg.userId === currentUser.id && currentUser.role !== AppRole.SUPER_ADMIN) {
      throw new ForbiddenException('You cannot approve your own regularization request');
    }

    if (currentUser.role === AppRole.TEAM_LEADER) {
      const actor = await this.prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { teamId: true },
      });
      if (!actor?.teamId || actor.teamId !== reg.user.teamId) {
        throw new ForbiddenException('You can only review regularizations for your own team');
      }
    }

    const decisionEnum =
      dto.decision === 'APPROVED' ? ApprovalDecision.APPROVED : ApprovalDecision.REJECTED;

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedReg = await tx.attendanceRegularization.update({
        where: { id },
        data: {
          status: decisionEnum,
          reviewedById: currentUser.id,
          reviewedAt: new Date(),
          remarks: dto.remarks?.trim() ?? null,
        },
        include: {
          user: { select: USER_SUMMARY_SELECT },
          reviewedBy: { select: { id: true, name: true, email: true } },
        },
      });

      if (decisionEnum === ApprovalDecision.APPROVED) {
        let totalHours = 8.5;
        if (reg.requestedIn && reg.requestedOut) {
          const diff = (reg.requestedOut.getTime() - reg.requestedIn.getTime()) / 3_600_000;
          totalHours = Math.max(0, Number(diff.toFixed(2)));
        }
        const status = this.resolveStatus(totalHours);

        await tx.attendanceMaster.upsert({
          where: {
            userId_attendanceDate: {
              userId: reg.userId,
              attendanceDate: reg.attendanceDate,
            },
          },
          update: {
            firstPunchIn: reg.requestedIn ?? undefined,
            lastPunchOut: reg.requestedOut ?? undefined,
            totalWorkHours: totalHours,
            officeHours: totalHours,
            status,
            isLate: false,
            remarks: `Regularized: ${reg.reason}`,
          },
          create: {
            userId: reg.userId,
            attendanceDate: reg.attendanceDate,
            firstPunchIn: reg.requestedIn,
            lastPunchOut: reg.requestedOut,
            totalWorkHours: totalHours,
            officeHours: totalHours,
            status,
            isLate: false,
            remarks: `Regularized: ${reg.reason}`,
          },
        });
      }

      return updatedReg;
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      targetUserId: reg.userId,
      actionType: `ATTENDANCE_REGULARIZATION_${dto.decision}`,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: { regularizationId: id, decision: dto.decision },
    });

    return updated;
  }

  /**
   * 09:45 AM Automated Latecomer Engine (Mon-Sat)
   */
  @Cron('45 9 * * 1-6')
  async runLatecomerScan() {
    const today = this.toUtcDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const activeUsers = await this.prisma.user.findMany({
      where: { isArchived: false, employmentStatus: EmploymentStatus.ACTIVE },
      select: { id: true, employeeId: true },
    });

    let flaggedCount = 0;

    for (const u of activeUsers) {
      const [punchCount, master] = await Promise.all([
        this.prisma.attendanceRawLog.count({
          where: {
            userId: u.id,
            rawTimestamp: { gte: today, lt: tomorrow },
          },
        }),
        this.prisma.attendanceMaster.findUnique({
          where: { userId_attendanceDate: { userId: u.id, attendanceDate: today } },
        }),
      ]);

      if (
        punchCount === 0 &&
        master?.status !== AttendanceStatus.ON_LEAVE &&
        master?.status !== AttendanceStatus.LOP
      ) {
        await this.prisma.attendanceMaster.upsert({
          where: { userId_attendanceDate: { userId: u.id, attendanceDate: today } },
          update: {
            isLate: true,
            remarks: 'Latecomer Alert (No punch by 09:45 AM)',
          },
          create: {
            userId: u.id,
            attendanceDate: today,
            status: AttendanceStatus.ABSENT,
            isLate: true,
            remarks: 'Latecomer Alert (No punch by 09:45 AM)',
          },
        });
        flaggedCount++;
      }
    }

    this.logger.log(`Morning latecomer scan complete: ${flaggedCount} employee(s) flagged.`);
    return { flaggedCount };
  }

  /**
   * 00:05 AM Daily Midnight Reconciliation
   */
  @Cron('5 0 * * *')
  async runMidnightReconciliation() {
    const yesterday = this.toUtcDay(new Date());
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return this.reconcileAllForDate(yesterday);
  }

  async reconcileAllForDate(targetDate?: string | Date) {
    const day = this.toUtcDay(targetDate ? new Date(targetDate) : new Date());
    const activeUsers = await this.prisma.user.findMany({
      where: { isArchived: false, employmentStatus: EmploymentStatus.ACTIVE },
      select: { id: true },
    });

    const results = [];
    for (const u of activeUsers) {
      results.push(await this.reconcileUserDay(u.id, day));
    }
    return { date: day.toISOString().slice(0, 10), reconciledCount: results.length };
  }

  async reconcileUserDay(userId: string, day: Date) {
    const existing = await this.prisma.attendanceMaster.findUnique({
      where: { userId_attendanceDate: { userId, attendanceDate: day } },
    });

    // Preserve approved Leave / LOP records synced from LeaveModule
    if (
      existing?.status === AttendanceStatus.ON_LEAVE ||
      existing?.status === AttendanceStatus.LOP
    ) {
      return existing;
    }

    const nextDay = new Date(day);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const [rawLogs, siteVisits] = await Promise.all([
      this.prisma.attendanceRawLog.findMany({
        where: {
          userId,
          rawTimestamp: { gte: day, lt: nextDay },
        },
        orderBy: { rawTimestamp: 'asc' },
      }),
      this.prisma.siteVisit.findMany({
        where: {
          userId,
          checkInTime: { gte: day, lt: nextDay },
          checkOutTime: { not: null },
        },
      }),
    ]);

    if (rawLogs.length === 0) {
      return existing ?? null;
    }

    const firstPunchIn = rawLogs[0].rawTimestamp;
    const lastPunchOut = rawLogs[rawLogs.length - 1].rawTimestamp;

    const officeLogs = rawLogs.filter((l) => l.source !== PunchSource.SITE_VISIT_GPS);
    let officeHours = 0;
    if (officeLogs.length >= 2) {
      const diffMs =
        officeLogs[officeLogs.length - 1].rawTimestamp.getTime() -
        officeLogs[0].rawTimestamp.getTime();
      officeHours = Math.max(0, Number((diffMs / 3_600_000).toFixed(2)));
    }

    const siteVisitHours = Number(
      siteVisits
        .reduce((sum, sv) => {
          if (!sv.checkOutTime) return sum;
          return sum + Math.max(0, (sv.checkOutTime.getTime() - sv.checkInTime.getTime()) / 3_600_000);
        }, 0)
        .toFixed(2),
    );

    const totalWorkHours = Number((officeHours + siteVisitHours).toFixed(2));
    const status =
      rawLogs.length === 1 && totalWorkHours === 0
        ? AttendanceStatus.HALF_DAY
        : this.resolveStatus(totalWorkHours);

    return this.prisma.attendanceMaster.upsert({
      where: { userId_attendanceDate: { userId, attendanceDate: day } },
      update: {
        firstPunchIn,
        lastPunchOut,
        officeHours,
        siteVisitHours,
        totalWorkHours,
        status,
      },
      create: {
        userId,
        attendanceDate: day,
        firstPunchIn,
        lastPunchOut,
        officeHours,
        siteVisitHours,
        totalWorkHours,
        status,
      },
    });
  }

  private resolveStatus(totalHours: number): AttendanceStatus {
    if (totalHours >= FULL_DAY_HOURS) return AttendanceStatus.PRESENT;
    if (totalHours >= HALF_DAY_HOURS) return AttendanceStatus.HALF_DAY;
    return AttendanceStatus.ABSENT;
  }

  private async buildUserScope(
    currentUser: AuthenticatedUser,
  ): Promise<{ userId?: string; OR?: Array<Record<string, unknown>> }> {
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

  private buildDateRange(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) return undefined;
    const range: { gte?: Date; lt?: Date } = {};
    if (startDate) {
      range.gte = this.toUtcDay(new Date(startDate));
    }
    if (endDate) {
      const end = this.toUtcDay(new Date(endDate));
      end.setUTCDate(end.getUTCDate() + 1);
      range.lt = end;
    }
    return range;
  }

  private toUtcDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }
}
