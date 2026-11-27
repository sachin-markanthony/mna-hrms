import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AttendanceStatus,
  EmploymentStatus,
  PayrollRunStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { GeneratePayrollDto } from './dto/generate-payroll.dto.js';
import type { UpdatePayslipDto } from './dto/update-payslip.dto.js';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const PAYSLIP_INCLUDE = {
  user: {
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      employee: {
        select: {
          jobTitle: true,
          bankName: true,
          bankAccountNumber: true,
          bankIfsc: true,
          panNumber: true,
          uanNumber: true,
          department: { select: { id: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.PayslipInclude;

const PAYROLL_RUN_INCLUDE = {
  generatedBy: { select: { id: true, name: true, email: true } },
  lockedBy: { select: { id: true, name: true, email: true } },
  paidBy: { select: { id: true, name: true, email: true } },
  payslips: {
    include: PAYSLIP_INCLUDE,
    orderBy: { user: { employeeId: 'asc' } },
  },
} satisfies Prisma.PayrollRunInclude;

export interface ComputedSalary {
  basicPay: number;
  hra: number;
  specialAllowance: number;
  lopDeduction: number;
  professionalTax: number;
  netPay: number;
}

/**
 * Computes 100% In-Hand Monthly Salary, proportional LOP deduction,
 * and Professional Tax (INR 200 when monthly salary >= 25,000).
 */
export function computePayslipNumbers(
  monthlyGross: number,
  workingDaysInMonth: number,
  lopDays: number,
  bonus: number,
  otherDeductions: number,
): ComputedSalary {
  const gross = Math.max(0, monthlyGross);
  const basicPay = Math.round(gross);
  const hra = 0;
  const specialAllowance = 0;
  const perDayRate = workingDaysInMonth > 0 ? gross / workingDaysInMonth : 0;
  const lopDeduction = Math.round(perDayRate * Math.max(0, lopDays));
  const professionalTax = gross >= 25000 ? 200 : 0;
  const netPay = Math.max(
    0,
    Math.round(
      gross +
        Math.max(0, bonus) -
        lopDeduction -
        professionalTax -
        Math.max(0, otherDeductions),
    ),
  );

  return {
    basicPay,
    hra,
    specialAllowance,
    lopDeduction,
    professionalTax,
    netPay,
  };
}

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listRuns() {
    return this.prisma.payrollRun.findMany({
      include: {
        generatedBy: { select: { id: true, name: true, email: true } },
        lockedBy: { select: { id: true, name: true, email: true } },
        paidBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async getRunById(runId: string) {
    const run = await this.prisma.payrollRun.findUnique({
      where: { id: runId },
      include: PAYROLL_RUN_INCLUDE,
    });
    if (!run) {
      throw new NotFoundException('Payroll run not found');
    }
    return run;
  }

  async getMyPayslips(userId: string) {
    return this.prisma.payslip.findMany({
      where: {
        userId,
        payrollRun: {
          status: { in: [PayrollRunStatus.LOCKED, PayrollRunStatus.PAID] },
          isPayslipVisible: true,
        },
      },
      include: {
        payrollRun: {
          select: {
            id: true,
            status: true,
            lockedAt: true,
            paidAt: true,
            isPayslipVisible: true,
            payslipsReleasedAt: true,
          },
        },
        ...PAYSLIP_INCLUDE,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  /** Returns non-revoked official letters (Offer Letters, etc.) matching the logged-in user. */
  async getMyOfficialLetters(user: { id: string; employeeId: string; email: string }) {
    return this.prisma.$queryRaw<
      Array<{
        id: string;
        refNumber: string;
        letterType: string;
        status: string;
        recipientName: string;
        recipientEmail: string;
        designation: string;
        department: string;
        annualGrossCtc: number | null;
        monthlyGross: number | null;
        joiningDate: Date | null;
        relievingDate: Date | null;
        workLocation: string | null;
        probationMonths: number | null;
        ceoName: string;
        ceoTitle: string;
        headOfHrName: string;
        headOfHrTitle: string;
        customNotes: string | null;
        employeeCode: string | null;
        recipientGender: string | null;
        candidateResponse: string | null;
        createdAt: Date;
      }>
    >`
      SELECT
        "id",
        "refNumber",
        "letterType"::text AS "letterType",
        "status"::text AS "status",
        "recipientName",
        "recipientEmail",
        "designation",
        "department",
        "annualGrossCtc",
        "monthlyGross",
        "joiningDate",
        "relievingDate",
        "workLocation",
        "probationMonths",
        "ceoName",
        "ceoTitle",
        "headOfHrName",
        "headOfHrTitle",
        "customNotes",
        "employeeCode",
        "recipientGender",
        "candidateResponse",
        "createdAt"
      FROM "official_letters"
      WHERE "status"::text <> 'REVOKED'
        AND (
          "employeeId" = ${user.id}
          OR "employeeId" IN (SELECT "id" FROM "employees" WHERE "userId" = ${user.id})
          OR "employeeCode" = ${user.employeeId}
          OR LOWER("recipientEmail") = LOWER(${user.email})
        )
      ORDER BY "createdAt" DESC
    `;
  }

  /**
   * Generates or recalculates a DRAFT payroll run for the requested month/year.
   * Rejects if the month is already LOCKED or PAID.
   */
  async generateRun(dto: GeneratePayrollDto, actorUserId: string, meta: RequestMeta) {
    const existingRun = await this.prisma.payrollRun.findUnique({
      where: { month_year: { month: dto.month, year: dto.year } },
      include: { payslips: true },
    });

    if (existingRun && existingRun.status !== PayrollRunStatus.DRAFT) {
      throw new ConflictException(
        `Payroll for ${MONTH_NAMES[dto.month - 1]} ${dto.year} is already ${existingRun.status} and cannot be regenerated.`,
      );
    }

    const workingDaysInMonth = new Date(Date.UTC(dto.year, dto.month, 0)).getUTCDate();
    const monthStart = new Date(Date.UTC(dto.year, dto.month - 1, 1));
    const monthEnd = new Date(Date.UTC(dto.year, dto.month - 1, workingDaysInMonth));

    const employees = await this.prisma.user.findMany({
      where: {
        isArchived: false,
        employmentStatus: { in: [EmploymentStatus.ACTIVE, EmploymentStatus.ON_NOTICE] },
        employee: { isNot: null },
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        employee: { select: { salary: true } },
      },
      orderBy: { employeeId: 'asc' },
    });

    const attendanceRows = await this.prisma.attendanceMaster.findMany({
      where: {
        userId: { in: employees.map((e) => e.id) },
        attendanceDate: { gte: monthStart, lte: monthEnd },
      },
      select: { userId: true, status: true },
    });

    const attendanceByUser = new Map<string, AttendanceStatus[]>();
    for (const row of attendanceRows) {
      const list = attendanceByUser.get(row.userId) ?? [];
      list.push(row.status);
      attendanceByUser.set(row.userId, list);
    }

    const existingPayslipByUser = new Map(
      (existingRun?.payslips ?? []).map((p) => [p.userId, p]),
    );

    const preparedPayslips = employees.map((emp) => {
      const statuses = attendanceByUser.get(emp.id) ?? [];
      let presentDays = 0;
      let halfDays = 0;
      let lopDays = 0;

      for (const st of statuses) {
        if (st === AttendanceStatus.PRESENT) {
          presentDays += 1;
        } else if (st === AttendanceStatus.HALF_DAY) {
          halfDays += 1;
          presentDays += 0.5;
          lopDays += 0.5;
        } else if (
          st === AttendanceStatus.LOP ||
          st === AttendanceStatus.ABSENT ||
          st === AttendanceStatus.ON_LEAVE
        ) {
          lopDays += 1;
        }
      }

      const prev = existingPayslipByUser.get(emp.id);
      const bonus = prev?.bonus ?? 0;
      const otherDeductions = prev?.otherDeductions ?? 0;
      const monthlyGross = emp.employee?.salary ?? 0;

      const computed = computePayslipNumbers(
        monthlyGross,
        workingDaysInMonth,
        lopDays,
        bonus,
        otherDeductions,
      );

      return {
        userId: emp.id,
        month: dto.month,
        year: dto.year,
        workingDaysInMonth,
        presentDays,
        halfDays,
        lopDays,
        monthlyGross,
        ...computed,
        bonus,
        otherDeductions,
        remarks: prev?.remarks ?? null,
      };
    });

    const totalEmployees = preparedPayslips.length;
    const totalGross = preparedPayslips.reduce((sum, p) => sum + p.monthlyGross, 0);
    const totalDeductions = preparedPayslips.reduce(
      (sum, p) => sum + p.lopDeduction + p.professionalTax + p.otherDeductions,
      0,
    );
    const totalNetPay = preparedPayslips.reduce((sum, p) => sum + p.netPay, 0);

    const run = await this.prisma.$transaction(async (tx) => {
      const savedRun = existingRun
        ? await tx.payrollRun.update({
            where: { id: existingRun.id },
            data: {
              totalEmployees,
              totalGross,
              totalDeductions,
              totalNetPay,
              generatedById: actorUserId,
              notes: dto.notes ?? existingRun.notes,
            },
          })
        : await tx.payrollRun.create({
            data: {
              month: dto.month,
              year: dto.year,
              status: PayrollRunStatus.DRAFT,
              totalEmployees,
              totalGross,
              totalDeductions,
              totalNetPay,
              generatedById: actorUserId,
              notes: dto.notes?.trim() || null,
            },
          });

      await tx.payslip.deleteMany({ where: { payrollRunId: savedRun.id } });
      if (preparedPayslips.length > 0) {
        await tx.payslip.createMany({
          data: preparedPayslips.map((p) => ({
            payrollRunId: savedRun.id,
            ...p,
          })),
        });
      }

      return tx.payrollRun.findUniqueOrThrow({
        where: { id: savedRun.id },
        include: PAYROLL_RUN_INCLUDE,
      });
    });

    await this.auditService.log({
      actorUserId,
      actionType: 'PAYROLL_GENERATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        payrollRunId: run.id,
        month: dto.month,
        year: dto.year,
        totalEmployees,
        totalNetPay,
      },
    });

    return run;
  }

  /** Adjusts bonus, otherDeductions, lopDays, or remarks on a DRAFT payslip. */
  async updatePayslip(
    payslipId: string,
    dto: UpdatePayslipDto,
    actorUserId: string,
    meta: RequestMeta,
  ) {
    const existing = await this.prisma.payslip.findUnique({
      where: { id: payslipId },
      include: { payrollRun: true },
    });

    if (!existing) {
      throw new NotFoundException('Payslip not found');
    }

    if (existing.payrollRun.status !== PayrollRunStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot modify payslip when payroll run is ${existing.payrollRun.status}.`,
      );
    }

    const lopDays = dto.lopDays ?? existing.lopDays;
    const bonus = dto.bonus ?? existing.bonus;
    const otherDeductions = dto.otherDeductions ?? existing.otherDeductions;

    const computed = computePayslipNumbers(
      existing.monthlyGross,
      existing.workingDaysInMonth,
      lopDays,
      bonus,
      otherDeductions,
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      const slip = await tx.payslip.update({
        where: { id: payslipId },
        data: {
          lopDays,
          bonus,
          otherDeductions,
          remarks: dto.remarks !== undefined ? dto.remarks : existing.remarks,
          ...computed,
        },
        include: PAYSLIP_INCLUDE,
      });

      const allSlips = await tx.payslip.findMany({
        where: { payrollRunId: existing.payrollRunId },
      });

      await tx.payrollRun.update({
        where: { id: existing.payrollRunId },
        data: {
          totalGross: allSlips.reduce((s, p) => s + p.monthlyGross, 0),
          totalDeductions: allSlips.reduce(
            (s, p) => s + p.lopDeduction + p.professionalTax + p.otherDeductions,
            0,
          ),
          totalNetPay: allSlips.reduce((s, p) => s + p.netPay, 0),
        },
      });

      return slip;
    });

    await this.auditService.log({
      actorUserId,
      targetUserId: existing.userId,
      actionType: 'PAYSLIP_ADJUSTED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        payslipId,
        lopDays,
        bonus,
        otherDeductions,
        netPay: updated.netPay,
      },
    });

    return updated;
  }

  /** Transitions DRAFT -> LOCKED (SuperAdmin only). */
  async lockRun(runId: string, actorUserId: string, meta: RequestMeta) {
    const run = await this.prisma.payrollRun.findUnique({ where: { id: runId } });
    if (!run) {
      throw new NotFoundException('Payroll run not found');
    }
    if (run.status !== PayrollRunStatus.DRAFT) {
      throw new BadRequestException(`Only DRAFT payroll runs can be locked (current: ${run.status}).`);
    }

    const updated = await this.prisma.payrollRun.update({
      where: { id: runId },
      data: {
        status: PayrollRunStatus.LOCKED,
        lockedById: actorUserId,
        lockedAt: new Date(),
      },
      include: PAYROLL_RUN_INCLUDE,
    });

    await this.auditService.log({
      actorUserId,
      actionType: 'PAYROLL_LOCKED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: { payrollRunId: runId, month: run.month, year: run.year },
    });

    return updated;
  }

  /** Transitions LOCKED -> PAID. */
  async markPaid(runId: string, actorUserId: string, meta: RequestMeta) {
    const run = await this.prisma.payrollRun.findUnique({ where: { id: runId } });
    if (!run) {
      throw new NotFoundException('Payroll run not found');
    }
    if (run.status !== PayrollRunStatus.LOCKED) {
      throw new BadRequestException(
        `Payroll run must be LOCKED before marking as PAID (current: ${run.status}).`,
      );
    }

    const updated = await this.prisma.payrollRun.update({
      where: { id: runId },
      data: {
        status: PayrollRunStatus.PAID,
        paidById: actorUserId,
        paidAt: new Date(),
      },
      include: PAYROLL_RUN_INCLUDE,
    });

    await this.auditService.log({
      actorUserId,
      actionType: 'PAYROLL_PAID',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: { payrollRunId: runId, month: run.month, year: run.year },
    });

    return updated;
  }

  /** Releases or hides LOCKED/PAID payslips in the employee self-service portal. */
  async setPayslipVisibility(
    runId: string,
    visible: boolean,
    actorUserId: string,
    meta: RequestMeta,
  ) {
    const run = await this.prisma.payrollRun.findUnique({ where: { id: runId } });
    if (!run) {
      throw new NotFoundException('Payroll run not found');
    }
    if (run.status === PayrollRunStatus.DRAFT) {
      throw new BadRequestException(
        'Lock the payroll run before releasing salary slips to employees.',
      );
    }

    const updated = await this.prisma.payrollRun.update({
      where: { id: runId },
      data: {
        isPayslipVisible: visible,
        payslipsReleasedAt: visible ? new Date() : null,
      },
      include: PAYROLL_RUN_INCLUDE,
    });

    await this.auditService.log({
      actorUserId,
      actionType: 'PAYROLL_PORTAL_VISIBILITY_UPDATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        payrollRunId: runId,
        month: run.month,
        year: run.year,
        isPayslipVisible: visible,
      },
    });

    return updated;
  }
}
