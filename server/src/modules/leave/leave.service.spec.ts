import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  ApprovalDecision,
  AttendanceStatus,
  LeaveStatus,
  LeaveType,
} from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRole } from '../../core/decorators/roles.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { LeaveService } from './leave.service.js';

describe('LeaveService', () => {
  let service: LeaveService;
  let prisma: {
    user: { findUnique: ReturnType<typeof vi.fn> };
    leaveBalance: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      createMany: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    leaveRequest: {
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    attendanceMaster: {
      upsert: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let auditService: { log: ReturnType<typeof vi.fn> };

  const employeeUser: AuthenticatedUser = {
    id: 'emp-1',
    email: 'priya.sales@markanthony.in',
    employeeId: 'EMP-005',
    name: 'Priya Menon',
    role: AppRole.EMPLOYEE,
    permissions: [],
    canImpersonate: false,
    isImpersonated: false,
  };

  const teamLeadUser: AuthenticatedUser = {
    id: 'tl-1',
    email: 'tl.dhinesh@markanthony.in',
    employeeId: 'EMP-004',
    name: 'Dhinesh Kumar',
    role: AppRole.TEAM_LEADER,
    permissions: [],
    canImpersonate: false,
    isImpersonated: false,
  };

  const hrUser: AuthenticatedUser = {
    id: 'hr-1',
    email: 'hr@markanthony.in',
    employeeId: 'EMP-002',
    name: 'Ananya Sharma',
    role: AppRole.HR_ADMIN,
    permissions: [],
    canImpersonate: false,
    isImpersonated: false,
  };

  beforeEach(() => {
    prisma = {
      user: { findUnique: vi.fn() },
      leaveBalance: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        createMany: vi.fn(),
        update: vi.fn(),
      },
      leaveRequest: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      attendanceMaster: {
        upsert: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(prisma)),
    };
    auditService = { log: vi.fn().mockResolvedValue({}) };

    service = new LeaveService(
      prisma as unknown as PrismaService,
      auditService as unknown as AuditService,
    );
  });

  it('should scope leave requests to team members + self for Team Leader', async () => {
    prisma.user.findUnique.mockResolvedValue({ teamId: 'team-east' });
    prisma.leaveRequest.findMany.mockResolvedValue([]);

    await service.getVisibleRequests(teamLeadUser, {});

    expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ userId: 'tl-1' }, { user: { teamId: 'team-east' } }],
        },
      }),
    );
  });

  it('should prevent Team Lead from approving a leave request outside their team', async () => {
    prisma.leaveRequest.findUnique.mockResolvedValue({
      id: 'req-1',
      userId: 'emp-other',
      user: { id: 'emp-other', teamId: 'team-south' },
    });
    prisma.user.findUnique.mockResolvedValue({ teamId: 'team-east' });

    await expect(
      service.submitTeamLeadDecision(
        'req-1',
        teamLeadUser,
        { decision: 'APPROVED' },
        {},
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should keep overall status PENDING when only Team Lead approves (HR still pending)', async () => {
    prisma.leaveRequest.findUnique.mockResolvedValue({
      id: 'req-1',
      userId: 'emp-1',
      leaveType: LeaveType.CASUAL,
      startDate: new Date('2026-12-01T00:00:00Z'),
      endDate: new Date('2026-12-02T00:00:00Z'),
      totalDays: 2,
      status: LeaveStatus.PENDING,
      teamLeadStatus: ApprovalDecision.PENDING,
      hrStatus: ApprovalDecision.PENDING,
      user: { id: 'emp-1', teamId: 'team-east' },
    });
    prisma.user.findUnique.mockResolvedValue({ teamId: 'team-east' });
    prisma.leaveRequest.update.mockResolvedValue({
      id: 'req-1',
      userId: 'emp-1',
      status: LeaveStatus.PENDING,
      teamLeadStatus: ApprovalDecision.APPROVED,
      hrStatus: ApprovalDecision.PENDING,
    });

    const result = await service.submitTeamLeadDecision(
      'req-1',
      teamLeadUser,
      { decision: 'APPROVED', remarks: 'TL approved' },
      {},
    );

    expect(result.status).toBe(LeaveStatus.PENDING);
    expect(prisma.leaveBalance.update).not.toHaveBeenCalled();
    expect(prisma.attendanceMaster.upsert).not.toHaveBeenCalled();
  });

  it('should finalize approval, deduct balance, and sync attendance_master when BOTH Team Lead and HR approve', async () => {
    prisma.leaveRequest.findUnique.mockResolvedValue({
      id: 'req-1',
      userId: 'emp-1',
      leaveType: LeaveType.CASUAL,
      startDate: new Date('2026-12-01T00:00:00Z'),
      endDate: new Date('2026-12-02T00:00:00Z'),
      totalDays: 2,
      status: LeaveStatus.PENDING,
      teamLeadStatus: ApprovalDecision.APPROVED,
      hrStatus: ApprovalDecision.PENDING,
    });
    prisma.leaveBalance.findUnique.mockResolvedValue({
      id: 'bal-1',
      remainingDays: 10,
      usedDays: 2,
    });
    prisma.leaveBalance.update.mockResolvedValue({});
    prisma.attendanceMaster.upsert.mockResolvedValue({});
    prisma.leaveRequest.update.mockResolvedValue({
      id: 'req-1',
      userId: 'emp-1',
      status: LeaveStatus.APPROVED,
      teamLeadStatus: ApprovalDecision.APPROVED,
      hrStatus: ApprovalDecision.APPROVED,
    });

    const result = await service.submitHrDecision(
      'req-1',
      hrUser,
      { decision: 'APPROVED', remarks: 'HR approved' },
      {},
    );

    expect(result.status).toBe(LeaveStatus.APPROVED);
    expect(prisma.leaveBalance.update).toHaveBeenCalledWith({
      where: { id: 'bal-1' },
      data: {
        usedDays: { increment: 2 },
        remainingDays: { decrement: 2 },
      },
    });
    expect(prisma.attendanceMaster.upsert).toHaveBeenCalledTimes(2);
    expect(prisma.attendanceMaster.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: AttendanceStatus.ON_LEAVE }),
      }),
    );
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: 'LEAVE_APPROVED_FINAL' }),
    );
  });

  it('should reject leave application when balance is insufficient', async () => {
    prisma.leaveRequest.findFirst.mockResolvedValue(null);
    prisma.leaveBalance.findMany.mockResolvedValue([
      { leaveType: LeaveType.CASUAL },
      { leaveType: LeaveType.SICK },
      { leaveType: LeaveType.EARNED },
      { leaveType: LeaveType.LOP },
    ]);
    prisma.leaveBalance.findUnique.mockResolvedValue({
      id: 'bal-1',
      remainingDays: 1,
    });

    await expect(
      service.applyLeave(
        employeeUser,
        {
          leaveType: LeaveType.CASUAL,
          startDate: '2026-12-01',
          endDate: '2026-12-03',
          reason: 'Out of station',
        },
        {},
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
