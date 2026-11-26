import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRole } from '../../core/decorators/roles.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { SettingsService } from './settings.service.js';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: {
    user: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
    department: { findUnique: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
    shiftSetting: {
      findUnique: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let auditService: { log: ReturnType<typeof vi.fn> };

  const hrAdmin: AuthenticatedUser = {
    id: 'hr-1',
    email: 'hr@markanthony.in',
    employeeId: 'EMP-002',
    name: 'Ananya',
    role: AppRole.HR_ADMIN,
    permissions: [],
    canImpersonate: false,
    isImpersonated: false,
  };

  const superAdmin: AuthenticatedUser = {
    id: 'sa-1',
    email: 'superadmin@markanthony.in',
    employeeId: 'EMP-001',
    name: 'Mark',
    role: AppRole.SUPER_ADMIN,
    permissions: [],
    canImpersonate: true,
    isImpersonated: false,
  };

  beforeEach(() => {
    prisma = {
      user: { findUnique: vi.fn(), update: vi.fn() },
      department: { findUnique: vi.fn(), delete: vi.fn() },
      shiftSetting: { findUnique: vi.fn(), updateMany: vi.fn(), create: vi.fn() },
      $transaction: vi.fn(async (cb) => cb(prisma)),
    };
    auditService = { log: vi.fn().mockResolvedValue({}) };

    service = new SettingsService(
      prisma as unknown as PrismaService,
      auditService as unknown as AuditService,
    );
  });

  it('should forbid HR_ADMIN from granting impersonation privilege', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u-5' });

    await expect(
      service.updateUserAccess('u-5', { canImpersonate: true }, hrAdmin, {}),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should prevent deleting a department that still has employees', async () => {
    prisma.department.findUnique.mockResolvedValue({
      id: 'd-1',
      name: 'Sales & Leasing',
      _count: { employees: 5 },
    });

    await expect(service.deleteDepartment('d-1', superAdmin.id, {})).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should clear previous default shift when creating a new default shift', async () => {
    prisma.shiftSetting.findUnique.mockResolvedValue(null);
    prisma.shiftSetting.updateMany.mockResolvedValue({ count: 1 });
    prisma.shiftSetting.create.mockResolvedValue({
      id: 'shift-2',
      name: 'Morning Field Shift',
      gracePeriodMinutes: 15,
      isDefault: true,
    });

    const shift = await service.createShift(
      {
        name: 'Morning Field Shift',
        startTime: '09:30',
        endTime: '18:30',
        gracePeriodMinutes: 15,
        fullDayHours: 8.5,
        halfDayHours: 4.0,
        isDefault: true,
      },
      superAdmin.id,
      {},
    );

    expect(shift.isDefault).toBe(true);
    expect(prisma.shiftSetting.updateMany).toHaveBeenCalledWith({
      data: { isDefault: false },
    });
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: 'SHIFT_CREATED' }),
    );
  });
});
