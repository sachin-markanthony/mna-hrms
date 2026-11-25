import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmploymentStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRole } from '../../core/decorators/roles.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let jwtService: {
    signAsync: ReturnType<typeof vi.fn>;
    verifyAsync: ReturnType<typeof vi.fn>;
  };
  let auditService: {
    log: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    process.env.JWT_IMPERSONATE_EXPIRES_IN = '1h';

    prisma = {
      user: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };
    jwtService = {
      signAsync: vi.fn().mockResolvedValue('signed-jwt-token'),
      verifyAsync: vi.fn(),
    };
    auditService = {
      log: vi.fn().mockResolvedValue({}),
    };

    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      auditService as unknown as AuditService,
    );
  });

  it('should authenticate active user, issue tokens, and record LOGIN audit log', async () => {
    const passwordHash = await bcrypt.hash('Secret@123', 4);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      employeeId: 'EMP-001',
      email: 'admin@markanthony.in',
      name: 'Super Admin',
      passwordHash,
      role: Role.SUPER_ADMIN,
      employmentStatus: EmploymentStatus.ACTIVE,
      isArchived: false,
    });
    prisma.user.update.mockResolvedValue({});

    const result = await service.login(
      { email: 'admin@markanthony.in', password: 'Secret@123' },
      { ipAddress: '127.0.0.1', userAgent: 'vitest' },
    );

    expect(result.accessToken).toBe('signed-jwt-token');
    expect(result.refreshToken).toBe('signed-jwt-token');
    expect(result.user.role).toBe(AppRole.SUPER_ADMIN);
    expect(prisma.user.update).toHaveBeenCalledTimes(1);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: 'user-1',
        actionType: 'LOGIN',
      }),
    );
  });

  it('should reject invalid password with UnauthorizedException', async () => {
    const passwordHash = await bcrypt.hash('Secret@123', 4);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      employeeId: 'EMP-001',
      email: 'admin@markanthony.in',
      name: 'Super Admin',
      passwordHash,
      role: Role.SUPER_ADMIN,
      employmentStatus: EmploymentStatus.ACTIVE,
      isArchived: false,
    });

    await expect(
      service.login({ email: 'admin@markanthony.in', password: 'WrongPassword' }, {}),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject archived user with ForbiddenException', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      employeeId: 'EMP-002',
      email: 'ex@markanthony.in',
      name: 'Former Employee',
      passwordHash: 'hash',
      role: Role.EMPLOYEE,
      employmentStatus: EmploymentStatus.ARCHIVED,
      isArchived: true,
    });

    await expect(
      service.login({ email: 'ex@markanthony.in', password: 'Secret@123' }, {}),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should allow SuperAdmin to impersonate another user and log IMPERSONATE_START', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'target-1',
      employeeId: 'EMP-010',
      email: 'dhinesh@markanthony.in',
      name: 'Dhinesh',
      role: Role.TEAM_LEADER,
      employmentStatus: EmploymentStatus.ACTIVE,
      isArchived: false,
    });

    const result = await service.impersonate(
      {
        id: 'admin-1',
        email: 'admin@markanthony.in',
        employeeId: 'EMP-001',
        name: 'MD',
        role: AppRole.SUPER_ADMIN,
        canImpersonate: true,
        isImpersonated: false,
      },
      'target-1',
      { ipAddress: '127.0.0.1' },
    );

    expect(result.user.isImpersonated).toBe(true);
    expect(result.user.originalAdminId).toBe('admin-1');
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: 'target-1',
        isImpersonated: true,
        originalAdminId: 'admin-1',
      }),
      expect.any(Object),
    );
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: 'admin-1',
        targetUserId: 'target-1',
        actionType: 'IMPERSONATE_START',
      }),
    );
  });

  it('should deny impersonation for non-SuperAdmin without privilege', async () => {
    await expect(
      service.impersonate(
        {
          id: 'emp-1',
          email: 'emp@markanthony.in',
          employeeId: 'EMP-020',
          name: 'Sales Rep',
          role: AppRole.EMPLOYEE,
          canImpersonate: false,
          isImpersonated: false,
        },
        'target-1',
        {},
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should exit impersonation and restore original SuperAdmin tokens', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'admin-1',
      employeeId: 'EMP-001',
      email: 'admin@markanthony.in',
      name: 'MD',
      role: Role.SUPER_ADMIN,
      employmentStatus: EmploymentStatus.ACTIVE,
      isArchived: false,
    });

    const result = await service.exitImpersonation(
      {
        id: 'target-1',
        email: 'dhinesh@markanthony.in',
        employeeId: 'EMP-010',
        name: 'Dhinesh',
        role: AppRole.TEAM_LEADER,
        canImpersonate: false,
        isImpersonated: true,
        originalAdminId: 'admin-1',
      },
      {},
    );

    expect(result.user.id).toBe('admin-1');
    expect(result.user.isImpersonated).toBe(false);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: 'admin-1',
        targetUserId: 'target-1',
        actionType: 'IMPERSONATE_EXIT',
      }),
    );
  });
});
