import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRole } from '../../core/decorators/roles.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { RolesService } from './roles.service.js';

describe('RolesService', () => {
  let service: RolesService;
  let prisma: {
    roleDefinition: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    permission: {
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    rolePermission: {
      deleteMany: ReturnType<typeof vi.fn>;
      createMany: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let auditService: { log: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    prisma = {
      roleDefinition: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      permission: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
      rolePermission: {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(prisma)),
    };
    auditService = { log: vi.fn().mockResolvedValue({}) };

    service = new RolesService(
      prisma as unknown as PrismaService,
      auditService as unknown as AuditService,
    );
  });

  it('should create a custom role and log ROLE_CREATED', async () => {
    prisma.roleDefinition.findUnique.mockResolvedValue(null);
    prisma.permission.count.mockResolvedValue(1);
    prisma.roleDefinition.create.mockResolvedValue({
      id: 'role-custom-1',
      name: 'FINANCE_MANAGER',
      displayName: 'Finance Manager',
      isSystem: false,
      permissions: [{ permission: { id: 'perm-1', key: 'payroll:run' } }],
    });

    const role = await service.createRole(
      {
        name: 'FINANCE_MANAGER',
        displayName: 'Finance Manager',
        permissionIds: ['perm-1'],
      },
      'admin-1',
      { ipAddress: '127.0.0.1' },
    );

    expect(role.name).toBe('FINANCE_MANAGER');
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: 'admin-1',
        actionType: 'ROLE_CREATED',
      }),
    );
  });

  it('should prevent modifying SUPER_ADMIN permissions', async () => {
    prisma.roleDefinition.findUnique.mockResolvedValue({
      id: 'role-sa',
      name: AppRole.SUPER_ADMIN,
      permissions: [],
    });

    await expect(
      service.syncPermissions('role-sa', ['perm-1'], 'admin-1', {}),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should prevent deleting system roles', async () => {
    prisma.roleDefinition.findUnique.mockResolvedValue({
      id: 'role-hr',
      name: AppRole.HR_ADMIN,
      isSystem: true,
      _count: { users: 0 },
    });

    await expect(service.deleteRole('role-hr', 'admin-1', {})).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should prevent deleting a custom role that still has users assigned', async () => {
    prisma.roleDefinition.findUnique.mockResolvedValue({
      id: 'role-custom',
      name: 'CUSTOM_ROLE',
      isSystem: false,
      _count: { users: 2 },
    });

    await expect(service.deleteRole('role-custom', 'admin-1', {})).rejects.toThrow(
      BadRequestException,
    );
  });
});
