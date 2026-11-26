import { BadRequestException } from '@nestjs/common';
import { AttendanceStatus, PunchDirection, PunchSource } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRole } from '../../core/decorators/roles.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { AttendanceService } from './attendance.service.js';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prisma: {
    user: { findUnique: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> };
    attendanceRawLog: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    attendanceMaster: {
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
    };
    siteVisit: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let auditService: { log: ReturnType<typeof vi.fn> };

  const salesRep: AuthenticatedUser = {
    id: 'emp-5',
    email: 'priya.sales@markanthony.in',
    employeeId: 'EMP-005',
    name: 'Priya Menon',
    role: AppRole.EMPLOYEE,
    permissions: [],
    canImpersonate: false,
    isImpersonated: false,
  };

  beforeEach(() => {
    prisma = {
      user: { findUnique: vi.fn(), findMany: vi.fn() },
      attendanceRawLog: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
      attendanceMaster: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn() },
      siteVisit: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
      $transaction: vi.fn(async (cb) => cb(prisma)),
    };
    auditService = { log: vi.fn().mockResolvedValue({}) };

    service = new AttendanceService(
      prisma as unknown as PrismaService,
      auditService as unknown as AuditService,
    );
  });

  it('should reject GPS site-visit punch outside 300m geofence', async () => {
    await expect(
      service.recordSiteVisitPunch(salesRep, {
        projectId: 'PROJ-1',
        projectName: 'Sobha Neopolis',
        direction: PunchDirection.IN,
        latitude: 12.9352,
        longitude: 77.6245,
        projectLat: 12.95, // > 1.5 km away
        projectLng: 77.64,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should accept GPS site-visit punch within 300m geofence', async () => {
    prisma.attendanceRawLog.create.mockResolvedValue({ id: 'raw-1' });
    prisma.siteVisit.create.mockResolvedValue({ id: 'sv-1', status: 'VALIDATED' });
    prisma.attendanceMaster.findUnique.mockResolvedValue(null);
    prisma.attendanceRawLog.findMany.mockResolvedValue([
      { source: PunchSource.SITE_VISIT_GPS, rawTimestamp: new Date() },
    ]);
    prisma.siteVisit.findMany.mockResolvedValue([]);
    prisma.attendanceMaster.upsert.mockResolvedValue({});

    const res = await service.recordSiteVisitPunch(salesRep, {
      projectId: 'PROJ-1',
      projectName: 'Sobha Neopolis',
      direction: PunchDirection.IN,
      latitude: 12.9352,
      longitude: 77.6245,
      projectLat: 12.9354,
      projectLng: 77.6246,
    });

    expect(res.siteVisit.status).toBe('VALIDATED');
    expect(prisma.attendanceRawLog.create).toHaveBeenCalledTimes(1);
  });

  it('should preserve ON_LEAVE records synced from LeaveModule during reconciliation', async () => {
    const leaveMaster = {
      id: 'att-1',
      status: AttendanceStatus.ON_LEAVE,
    };
    prisma.attendanceMaster.findUnique.mockResolvedValue(leaveMaster);

    const result = await service.reconcileUserDay('emp-5', new Date('2026-11-25T00:00:00Z'));

    expect(result).toEqual(leaveMaster);
    expect(prisma.attendanceMaster.upsert).not.toHaveBeenCalled();
  });

  it('should reject facial hardware punch with confidence below 85%', async () => {
    await expect(
      service.recordHardwarePunch(
        {
          employeeId: 'EMP-005',
          direction: PunchDirection.IN,
          faceConfidence: 72,
        },
        {},
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
