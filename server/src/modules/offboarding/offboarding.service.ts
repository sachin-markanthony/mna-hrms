import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EmploymentStatus, NocStatus, OffboardingStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { MailService } from '../../shared/mail/mail.service.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import {
  ApproveOffboardingDto,
  CreateOffboardingDto,
  NocCheckpointType,
  NocClearanceStatus,
  TerminateEmployeeDto,
  UpdateNocDto,
} from './dto/offboarding.dto.js';

const NOTICE_DAYS = 30;

const OFFBOARDING_INCLUDE = {
  user: {
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      employmentStatus: true,
    },
  },
  employee: {
    select: {
      id: true,
      jobTitle: true,
      hireDate: true,
      department: { select: { id: true, name: true } },
    },
  },
  initiatedBy: {
    select: { id: true, name: true, email: true },
  },
} as const;

@Injectable()
export class OffboardingService {
  private readonly logger = new Logger(OffboardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly mailService: MailService,
  ) {}

  private isHrOrAdmin(role?: string) {
    return role === 'SUPER_ADMIN' || role === 'HR_ADMIN' || role === 'HR_COORDINATOR';
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  private formatDateDDMMYYYY(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  async listOffboardings(currentUser: AuthenticatedUser, status?: OffboardingStatus) {
    const isHr = this.isHrOrAdmin(currentUser.role);
    const where: any = {};

    if (!isHr) {
      where.userId = currentUser.id;
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.offboardingRequest.findMany({
      where,
      include: OFFBOARDING_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async initiateOffboarding(
    dto: CreateOffboardingDto,
    currentUser: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    const isHr = this.isHrOrAdmin(currentUser.role);

    let targetEmployee = null;
    if (dto.employeeId && isHr) {
      targetEmployee = await this.prisma.employee.findFirst({
        where: { OR: [{ id: dto.employeeId }, { userId: dto.employeeId }] },
        include: { user: true },
      });
    } else {
      targetEmployee = await this.prisma.employee.findUnique({
        where: { userId: currentUser.id },
        include: { user: true },
      });
    }

    if (!targetEmployee) {
      throw new NotFoundException('Employee profile not found for offboarding.');
    }

    const existingActive = await this.prisma.offboardingRequest.findFirst({
      where: {
        userId: targetEmployee.userId,
        status: { in: [OffboardingStatus.PENDING_APPROVAL, OffboardingStatus.IN_NOTICE] },
      },
    });

    if (existingActive) {
      throw new ConflictException(
        'An active offboarding / notice period request already exists for this employee.',
      );
    }

    const resignationDate = dto.resignationDate ? new Date(dto.resignationDate) : new Date();
    const lastWorkingDay = this.addDays(resignationDate, NOTICE_DAYS);
    const initialStatus = isHr
      ? OffboardingStatus.IN_NOTICE
      : OffboardingStatus.PENDING_APPROVAL;

    const created = await this.prisma.offboardingRequest.create({
      data: {
        userId: targetEmployee.userId,
        employeeId: targetEmployee.id,
        initiatedById: currentUser.id,
        offboardingType: 'RESIGNATION',
        status: initialStatus,
        resignationDate,
        lastWorkingDay,
        noticePeriodDays: NOTICE_DAYS,
        reason: dto.reason.trim(),
        handoverNotes: dto.handoverNotes?.trim() || null,
        approvedAt: isHr ? new Date() : null,
      },
      include: OFFBOARDING_INCLUDE,
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      targetUserId: targetEmployee.userId,
      actionType: 'OFFBOARDING_INITIATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        offboardingId: created.id,
        offboardingType: 'RESIGNATION',
        employeeId: created.user.employeeId,
        employeeName: created.user.name,
        status: created.status,
        resignationDate: created.resignationDate.toISOString(),
        lastWorkingDay: created.lastWorkingDay.toISOString(),
        noticePeriodDays: NOTICE_DAYS,
        reason: created.reason,
      },
    });

    this.sendOffboardingMail(
      created.user.email,
      isHr
        ? 'Offboarding & 30-Day Notice Period Started — Mark Anthony Ventures'
        : 'Resignation Request Received — Mark Anthony Ventures',
      `Dear ${created.user.name},

${
  isHr
    ? 'Your offboarding and 1-month (30-day) notice period has been initiated.'
    : 'Your resignation request has been submitted and is pending HR review.'
}

Details:
- Employee ID: ${created.user.employeeId}
- Resignation Date: ${this.formatDateDDMMYYYY(created.resignationDate)}
- Notice Period: 30 Days
- Last Working Day: ${this.formatDateDDMMYYYY(created.lastWorkingDay)}

On your Last Working Day, both you and HR will complete the final procedure:
1. Return of Company Assets
2. Experience & Relieving Letter issuance

Best regards,
Shilpa Kumari.P
Head of Human Resource /Finance
Mark Anthony Ventures`,
    );

    return created;
  }

  /**
   * HR Admin / Super Admin direct termination:
   * Immediately terminates the employee, revokes portal access, sends termination notice email, and records audit log.
   */
  async terminateEmployee(
    dto: TerminateEmployeeDto,
    currentUser: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    if (!this.isHrOrAdmin(currentUser.role)) {
      throw new ForbiddenException('Only HR & Administrators can terminate an employee.');
    }

    const targetEmployee = await this.prisma.employee.findFirst({
      where: { OR: [{ id: dto.employeeId }, { userId: dto.employeeId }] },
      include: { user: true },
    });

    if (!targetEmployee) {
      throw new NotFoundException('Employee not found.');
    }

    if (targetEmployee.userId === currentUser.id) {
      throw new BadRequestException('You cannot terminate your own account.');
    }

    const effectiveDate = dto.effectiveDate ? new Date(dto.effectiveDate) : new Date();
    const now = new Date();

    const created = await this.prisma.$transaction(async (tx) => {
      // Close any existing active resignation/notice request if present
      await tx.offboardingRequest.updateMany({
        where: {
          userId: targetEmployee.userId,
          status: { in: [OffboardingStatus.PENDING_APPROVAL, OffboardingStatus.IN_NOTICE] },
        },
        data: {
          status: OffboardingStatus.WITHDRAWN,
          withdrawnAt: now,
        },
      });

      const req = await tx.offboardingRequest.create({
        data: {
          userId: targetEmployee.userId,
          employeeId: targetEmployee.id,
          initiatedById: currentUser.id,
          offboardingType: 'TERMINATION',
          status: OffboardingStatus.IN_NOTICE,
          resignationDate: effectiveDate,
          lastWorkingDay: effectiveDate,
          noticePeriodDays: 0,
          reason: dto.reason.trim(),
          approvedAt: now,
        },
        include: OFFBOARDING_INCLUDE,
      });

      return req;
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      targetUserId: targetEmployee.userId,
      actionType: 'EMPLOYEE_TERMINATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        offboardingId: created.id,
        offboardingType: 'TERMINATION',
        employeeId: created.user.employeeId,
        employeeName: created.user.name,
        recipientEmail: created.user.email,
        effectiveDate: effectiveDate.toISOString(),
        reason: created.reason,
      },
    });

    const subject = 'Notice of Employment Termination — Mark Anthony Ventures';
    const text = `Dear ${created.user.name},

This is to formally inform you that your employment with Mark Anthony Ventures (Employee ID: ${created.user.employeeId}) has been terminated with effect from ${this.formatDateDDMMYYYY(effectiveDate)}.

Reason: ${created.reason}

Please return any company assets in your possession (laptop, ID card, SIM, or company devices) to HR/Admin at the earliest to complete final formalities.

Best regards,
Shilpa Kumari.P
Head of Human Resource /Finance
Mark Anthony Ventures`;

    if (created.user.email && this.mailService.isConfigured()) {
      const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; margin: 0; padding: 12px 0;">
  ${text
    .split('\n\n')
    .map(
      (p) =>
        `<p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">${p.replace(/\n/g, '<br>')}</p>`,
    )
    .join('\n')}
</body>
</html>`.trim();

      try {
        const mailRes = await this.mailService.sendMail({
          to: created.user.email,
          subject,
          text,
          html,
        });

        await this.auditService.log({
          actorUserId: currentUser.id,
          targetUserId: targetEmployee.userId,
          actionType: 'TERMINATION_EMAIL_SENT',
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          newValuePayload: {
            offboardingId: created.id,
            recipientEmail: created.user.email,
            messageId: mailRes.messageId,
            sentAt: new Date().toISOString(),
          },
        });
      } catch (err) {
        this.logger.error(
          `Failed to send termination email to ${created.user.email}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return created;
  }

  async approveResignation(
    id: string,
    dto: ApproveOffboardingDto,
    currentUser: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    if (!this.isHrOrAdmin(currentUser.role)) {
      throw new ForbiddenException('Only HR & Administrators can approve or adjust notice period.');
    }

    const existing = await this.prisma.offboardingRequest.findUnique({
      where: { id },
      include: OFFBOARDING_INCLUDE,
    });
    if (!existing) {
      throw new NotFoundException('Offboarding request not found.');
    }
    if (
      existing.status === OffboardingStatus.COMPLETED ||
      existing.status === OffboardingStatus.WITHDRAWN
    ) {
      throw new BadRequestException(`Cannot update offboarding in status ${existing.status}.`);
    }

    const nextLwd = dto.lastWorkingDay ? new Date(dto.lastWorkingDay) : existing.lastWorkingDay;
    const diffDays = Math.max(
      0,
      Math.ceil((nextLwd.getTime() - existing.resignationDate.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const updated = await this.prisma.offboardingRequest.update({
      where: { id },
      data: {
        status: OffboardingStatus.IN_NOTICE,
        lastWorkingDay: nextLwd,
        noticePeriodDays: diffDays,
        earlyReleaseRemarks: dto.earlyReleaseRemarks?.trim() || existing.earlyReleaseRemarks,
        approvedAt: existing.approvedAt || new Date(),
      },
      include: OFFBOARDING_INCLUDE,
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      targetUserId: updated.userId,
      actionType: dto.lastWorkingDay ? 'OFFBOARDING_LWD_UPDATED' : 'OFFBOARDING_APPROVED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: {
        status: existing.status,
        lastWorkingDay: existing.lastWorkingDay.toISOString(),
      },
      newValuePayload: {
        offboardingId: updated.id,
        status: updated.status,
        lastWorkingDay: updated.lastWorkingDay.toISOString(),
        noticePeriodDays: updated.noticePeriodDays,
        earlyReleaseRemarks: updated.earlyReleaseRemarks,
      },
    });

    this.sendOffboardingMail(
      updated.user.email,
      'Resignation Accepted & Notice Period Confirmed — Mark Anthony Ventures',
      `Dear ${updated.user.name},

Your resignation has been accepted by HR and your notice period is active.

Confirmed Dates:
- Resignation Date: ${this.formatDateDDMMYYYY(updated.resignationDate)}
- Last Working Day: ${this.formatDateDDMMYYYY(updated.lastWorkingDay)} (${updated.noticePeriodDays} days notice)
${updated.earlyReleaseRemarks ? `- Note: ${updated.earlyReleaseRemarks}\n` : ''}
On your Last Working Day, both you and HR will complete the Assets return and Experience Letter procedure.

Best regards,
Shilpa Kumari.P
Head of Human Resource /Finance
Mark Anthony Ventures`,
    );

    return updated;
  }

  async updateNoc(
    id: string,
    dto: UpdateNocDto,
    currentUser: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    if (!this.isHrOrAdmin(currentUser.role) && currentUser.role !== 'TEAM_LEADER') {
      throw new ForbiddenException('Only HR, Administrators, or Team Leads can update NOC status.');
    }

    const existing = await this.prisma.offboardingRequest.findUnique({
      where: { id },
      include: OFFBOARDING_INCLUDE,
    });
    if (!existing) {
      throw new NotFoundException('Offboarding request not found.');
    }
    if (
      existing.status !== OffboardingStatus.IN_NOTICE &&
      !(existing.status === OffboardingStatus.COMPLETED && dto.checkpoint === NocCheckpointType.EXPERIENCE_LETTER)
    ) {
      throw new BadRequestException('NOC clearances can only be updated during an active notice period.');
    }

    const cleared = dto.status === NocClearanceStatus.CLEARED;
    const now = cleared ? new Date() : null;
    const actorName = cleared ? currentUser.name : null;
    const remarks = dto.remarks?.trim() || null;

    const data: Record<string, any> = {};
    if (dto.checkpoint === NocCheckpointType.ASSETS) {
      data.assetsNocStatus = cleared ? NocStatus.CLEARED : NocStatus.PENDING;
      data.assetsClearedBy = actorName;
      data.assetsClearedAt = now;
      data.assetsRemarks = remarks;
    } else if (dto.checkpoint === NocCheckpointType.EXPERIENCE_LETTER) {
      data.hrNocStatus = cleared ? NocStatus.CLEARED : NocStatus.PENDING;
      data.hrClearedBy = actorName;
      data.hrClearedAt = now;
      data.hrRemarks = remarks;
    }

    const updated = await this.prisma.offboardingRequest.update({
      where: { id },
      data,
      include: OFFBOARDING_INCLUDE,
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      targetUserId: updated.userId,
      actionType: 'OFFBOARDING_NOC_UPDATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        offboardingId: updated.id,
        employeeId: updated.user.employeeId,
        checkpoint: dto.checkpoint,
        status: dto.status,
        remarks,
        clearedBy: currentUser.name,
      },
    });

    return updated;
  }

  async completeOffboarding(
    id: string,
    currentUser: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    if (!this.isHrOrAdmin(currentUser.role)) {
      throw new ForbiddenException('Only HR & Administrators can finalize offboarding.');
    }

    const existing = await this.prisma.offboardingRequest.findUnique({
      where: { id },
      include: OFFBOARDING_INCLUDE,
    });
    if (!existing) {
      throw new NotFoundException('Offboarding request not found.');
    }
    if (existing.status !== OffboardingStatus.IN_NOTICE) {
      throw new BadRequestException('Only active notice-period requests can be completed.');
    }

    if (existing.assetsNocStatus !== NocStatus.CLEARED) {
      throw new BadRequestException(
        'Company Assets clearance must be CLEARED before completing offboarding.',
      );
    }

    if (existing.hrNocStatus !== NocStatus.CLEARED) {
      throw new BadRequestException(
        'Experience & Relieving Letter must be issued & emailed (cleared) before completing offboarding.',
      );
    }

    const now = new Date();
    const deactivateAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const updated = await this.prisma.offboardingRequest.update({
      where: { id },
      data: {
        status: OffboardingStatus.COMPLETED,
        completedAt: now,
      },
      include: OFFBOARDING_INCLUDE,
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      targetUserId: updated.userId,
      actionType: 'OFFBOARDING_COMPLETED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: { status: existing.status },
      newValuePayload: {
        offboardingId: updated.id,
        offboardingType: updated.offboardingType,
        employeeId: updated.user.employeeId,
        employeeName: updated.user.name,
        lastWorkingDay: updated.lastWorkingDay.toISOString(),
        completedAt: now.toISOString(),
        portalGraceDays: 7,
        portalGraceUntil: deactivateAt.toISOString(),
      },
    });

    this.sendOffboardingMail(
      updated.user.email,
      'Offboarding Completed (7-Day Portal Access to Download Official Letters) — Mark Anthony Ventures',
      `Dear ${updated.user.name},

Your Assets clearance and Experience & Relieving Letter procedure are now complete as of ${this.formatDateDDMMYYYY(updated.lastWorkingDay)}.

You can access the HRMS portal for the next 7 days (using only the Official Letters section) to download all your important official letters (Offer Letter, Salary Slips, and Experience & Relieving Certificate). After 7 days, your account will automatically be marked inactive.

Best regards,
Shilpa Kumari.P
Head of Human Resource /Finance
Mark Anthony Ventures`,
    );

    return updated;
  }

  async withdrawOffboarding(
    id: string,
    currentUser: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    const existing = await this.prisma.offboardingRequest.findUnique({
      where: { id },
      include: OFFBOARDING_INCLUDE,
    });
    if (!existing) {
      throw new NotFoundException('Offboarding request not found.');
    }

    const isHr = this.isHrOrAdmin(currentUser.role);
    if (!isHr && existing.userId !== currentUser.id) {
      throw new ForbiddenException('You can only withdraw your own resignation request.');
    }
    if (!isHr && existing.status !== OffboardingStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        'Resignation is already in notice period; please contact HR to withdraw.',
      );
    }
    if (
      existing.status === OffboardingStatus.COMPLETED ||
      existing.status === OffboardingStatus.WITHDRAWN
    ) {
      throw new BadRequestException(`Cannot withdraw offboarding in status ${existing.status}.`);
    }

    const updated = await this.prisma.offboardingRequest.update({
      where: { id },
      data: {
        status: OffboardingStatus.WITHDRAWN,
        withdrawnAt: new Date(),
      },
      include: OFFBOARDING_INCLUDE,
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      targetUserId: updated.userId,
      actionType: 'OFFBOARDING_WITHDRAWN',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: { status: existing.status },
      newValuePayload: {
        offboardingId: updated.id,
        employeeId: updated.user.employeeId,
        withdrawnBy: currentUser.name,
      },
    });

    return updated;
  }

  /**
   * Hourly check: automatically deactivate employee portal access 7 days
   * after offboarding is marked COMPLETED, while recording a SystemAuditLog entry.
   */
  @Cron('0 * * * *')
  async deactivateExpiredOffboardedUsers() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const expired = await this.prisma.offboardingRequest.findMany({
      where: {
        status: OffboardingStatus.COMPLETED,
        completedAt: { lte: cutoff },
        user: { employmentStatus: EmploymentStatus.ACTIVE },
      },
      include: {
        user: { select: { id: true, employeeId: true, email: true, name: true } },
      },
    });

    for (const req of expired) {
      await this.prisma.user.update({
        where: { id: req.userId },
        data: {
          employmentStatus: EmploymentStatus.INACTIVE,
          refreshTokenHash: null,
        },
      });

      await this.auditService.log({
        actorUserId: req.initiatedById || req.userId,
        targetUserId: req.userId,
        actionType: 'OFFBOARDING_ACCOUNT_DEACTIVATED',
        newValuePayload: {
          offboardingId: req.id,
          employeeId: req.user.employeeId,
          email: req.user.email,
          completedAt: req.completedAt?.toISOString(),
          deactivatedAt: new Date().toISOString(),
          reason: '7-day post-offboarding portal access window expired',
        },
      });
    }
  }

  /**
   * Daily 9:00 AM check: when an employee reaches their Last Working Day (notice period completed),
   * notify BOTH the employee and HR Admins to complete Assets & Experience Letter procedure.
   */
  @Cron('0 9 * * *')
  async sendLastDayProcedureReminders() {
    if (!this.mailService.isConfigured()) return;

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const dueRequests = await this.prisma.offboardingRequest.findMany({
      where: {
        status: OffboardingStatus.IN_NOTICE,
        lastDayNotifiedAt: null,
        lastWorkingDay: { lte: endOfToday },
      },
      include: OFFBOARDING_INCLUDE,
    });

    if (dueRequests.length === 0) return;

    const hrAdmins = await this.prisma.user.findMany({
      where: {
        isArchived: false,
        role: { in: ['SUPER_ADMIN', 'HR_ADMIN'] },
      },
      select: { id: true, email: true, name: true },
    });
    const hrEmails = hrAdmins.map((u) => u.email).filter(Boolean);

    for (const req of dueRequests) {
      const lwdStr = this.formatDateDDMMYYYY(req.lastWorkingDay);

      // 1. Email Employee
      this.sendOffboardingMail(
        req.user.email,
        'Last Working Day Reminder: Complete Offboarding Procedure — Mark Anthony Ventures',
        `Dear ${req.user.name},

Today (${lwdStr}) marks the completion of your 30-day notice period (Last Working Day).

Please complete your final offboarding procedure with HR today:
1. Return all company assets (Laptop, ID Card, SIM, CRM/HRMS devices)
2. Collect / download your Experience & Relieving Certificate

Best regards,
Shilpa Kumari.P
Head of Human Resource /Finance
Mark Anthony Ventures`,
      );

      // 2. Email HR Admins
      if (hrEmails.length > 0) {
        this.sendOffboardingMail(
          hrEmails.join(','),
          `Last Working Day Alert: ${req.user.name} (${req.user.employeeId})`,
          `Hello HR Team,

${req.user.name} (${req.user.employeeId}) has completed their 30-day notice period today (${lwdStr}).

Please complete their final offboarding procedure in HRMS:
1. Verify & clear Company Assets return
2. Complete Offboarding & issue their Experience & Relieving Certificate

Mark Anthony Ventures HRMS`,
        );
      }

      await this.prisma.offboardingRequest.update({
        where: { id: req.id },
        data: { lastDayNotifiedAt: new Date() },
      });

      if (hrAdmins[0]?.id) {
        await this.auditService.log({
          actorUserId: hrAdmins[0].id,
          targetUserId: req.userId,
          actionType: 'OFFBOARDING_LAST_DAY_NOTIFIED',
          newValuePayload: {
            offboardingId: req.id,
            employeeId: req.user.employeeId,
            lastWorkingDay: req.lastWorkingDay.toISOString(),
            notifiedEmployee: req.user.email,
            notifiedHrCount: hrEmails.length,
          },
        });
      }
    }
  }

  private sendOffboardingMail(to: string, subject: string, text: string) {
    if (!to || !this.mailService.isConfigured()) return;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; margin: 0; padding: 12px 0;">
  ${text
    .split('\n\n')
    .map(
      (p) =>
        `<p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">${p.replace(/\n/g, '<br>')}</p>`,
    )
    .join('\n')}
</body>
</html>`.trim();

    void this.mailService.sendMail({ to, subject, text, html }).catch((err) => {
      this.logger.error(
        `Failed to send offboarding email to ${to}: ${err instanceof Error ? err.message : String(err)}`,
      );
    });
  }
}
