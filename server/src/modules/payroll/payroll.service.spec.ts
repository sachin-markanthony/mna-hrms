import { BadRequestException, ConflictException } from '@nestjs/common';
import { AttendanceStatus, PayrollRunStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../prisma/prisma.service.js';
import type { AuditService } from '../audit/audit.service.js';
import { computePayslipNumbers, PayrollService } from './payroll.service.js';

describe('PayrollService', () => {
  let service: PayrollService;
  let prisma: {
    payrollRun: {
      findUnique: ReturnType<typeof vi.fn>;
      findUniqueOrThrow: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    payslip: {
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
      createMany: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    user: { findMany: ReturnType<typeof vi.fn> };
    attendanceMaster: { findMany: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let auditService: { log: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    prisma = {
      payrollRun: {
        findUnique: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      payslip: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        deleteMany: vi.fn(),
        createMany: vi.fn(),
        update: vi.fn(),
      },
      user: { findMany: vi.fn() },
      attendanceMaster: { findMany: vi.fn() },
      $transaction: vi.fn(async (cb) => cb(prisma)),
    };
    auditService = { log: vi.fn().mockResolvedValue({}) };

    service = new PayrollService(
      prisma as unknown as PrismaService,
      auditService as unknown as AuditService,
    );
  });

  it('computes 100% in-hand salary, proportional LOP, and PT=200 when salary >= 25000', () => {
    const res = computePayslipNumbers(60000, 30, 2, 1000, 500);
    expect(res).toEqual({
      basicPay: 60000,
      hra: 0,
      specialAllowance: 0,
      lopDeduction: 4000,
      professionalTax: 200,
      netPay: 56300,
    });

    const underThreshold = computePayslipNumbers(24000, 30, 0, 0, 0);
    expect(underThreshold.professionalTax).toBe(0);
    expect(underThreshold.netPay).toBe(24000);
  });

  it('rejects regenerating a LOCKED or PAID payroll run', async () => {
    prisma.payrollRun.findUnique.mockResolvedValue({
      id: 'run-1',
      status: PayrollRunStatus.LOCKED,
      payslips: [],
    });

    await expect(
      service.generateRun({ month: 11, year: 2026 }, 'admin-1', {}),
    ).rejects.toThrow(ConflictException);
  });

  it('generates a DRAFT run with auto-calculated LOP deductions from attendance', async () => {
    prisma.payrollRun.findUnique.mockResolvedValue(null);
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'u-1',
        employeeId: 'EMP-005',
        name: 'Priya Menon',
        email: 'priya@markanthony.in',
        employee: { salary: 30000 },
      },
    ]);
    prisma.attendanceMaster.findMany.mockResolvedValue([
      { userId: 'u-1', status: AttendanceStatus.PRESENT },
      { userId: 'u-1', status: AttendanceStatus.LOP },
      { userId: 'u-1', status: AttendanceStatus.HALF_DAY },
    ]);
    prisma.payrollRun.create.mockResolvedValue({ id: 'run-nov' });
    prisma.payrollRun.findUniqueOrThrow.mockResolvedValue({
      id: 'run-nov',
      status: PayrollRunStatus.DRAFT,
      totalEmployees: 1,
      totalGross: 30000,
      totalDeductions: 1500,
      totalNetPay: 28500,
      payslips: [],
    });

    const run = await service.generateRun({ month: 11, year: 2026 }, 'admin-1', {});
    expect(run.id).toBe('run-nov');
    expect(prisma.payslip.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: 'u-1',
          workingDaysInMonth: 30,
          lopDays: 1.5,
          lopDeduction: 1500,
          professionalTax: 200,
          netPay: 28300,
        }),
      ],
    });
  });

  it('prevents marking a DRAFT run as PAID before locking', async () => {
    prisma.payrollRun.findUnique.mockResolvedValue({
      id: 'run-1',
      status: PayrollRunStatus.DRAFT,
    });

    await expect(service.markPaid('run-1', 'admin-1', {})).rejects.toThrow(BadRequestException);
  });

  it('prevents releasing a DRAFT run to employee portal and allows LOCKED runs', async () => {
    prisma.payrollRun.findUnique.mockResolvedValueOnce({
      id: 'run-1',
      status: PayrollRunStatus.DRAFT,
    });
    await expect(service.setPayslipVisibility('run-1', true, 'hr-1', {})).rejects.toThrow(
      BadRequestException,
    );

    prisma.payrollRun.findUnique.mockResolvedValueOnce({
      id: 'run-1',
      month: 11,
      year: 2026,
      status: PayrollRunStatus.LOCKED,
    });
    prisma.payrollRun.update.mockResolvedValueOnce({
      id: 'run-1',
      isPayslipVisible: true,
    });

    const res = await service.setPayslipVisibility('run-1', true, 'hr-1', {});
    expect(res.isPayslipVisible).toBe(true);
  });
});
