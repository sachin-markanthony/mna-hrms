import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRole } from '../../core/decorators/roles.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { EmployeesService } from './employees.service.js';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let prisma: {
    user: { findFirst: ReturnType<typeof vi.fn>; findUnique: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
    roleDefinition: { findUnique: ReturnType<typeof vi.fn> };
    employee: { findMany: ReturnType<typeof vi.fn>; findFirst: ReturnType<typeof vi.fn>; findUnique: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
    leaveBalance: { createMany: ReturnType<typeof vi.fn> };
    employeeDocument: { create: ReturnType<typeof vi.fn>; findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let auditService: { log: ReturnType<typeof vi.fn> };

  const hrUser: AuthenticatedUser = {
    id: 'hr-1',
    email: 'hr@markanthony.in',
    employeeId: 'EMP-002',
    name: 'Ananya Sharma',
    role: AppRole.HR_ADMIN,
    permissions: [],
  };

  const regularEmployee: AuthenticatedUser = {
    id: 'emp-5',
    email: 'priya.sales@markanthony.in',
    employeeId: 'EMP-005',
    name: 'Priya Menon',
    role: AppRole.EMPLOYEE,
    permissions: [],
  };

  beforeEach(() => {
    prisma = {
      user: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
      roleDefinition: { findUnique: vi.fn() },
      employee: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
      leaveBalance: { createMany: vi.fn() },
      officialLetter: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
      employeeDocument: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
      $transaction: vi.fn(async (cb) => cb(prisma)),
    };
    auditService = { log: vi.fn().mockResolvedValue({}) };

    service = new EmployeesService(
      prisma as unknown as PrismaService,
      auditService as unknown as AuditService,
      { isConfigured: vi.fn().mockReturnValue(false), sendMail: vi.fn() } as any,
    );
  });

  it('should scope directory listing to self and forbid viewing another employee dossier for EMPLOYEE', async () => {
    prisma.employee.findMany.mockResolvedValue([]);

    await service.findAll(regularEmployee, {});
    expect(prisma.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: regularEmployee.id,
        }),
      }),
    );

    prisma.employee.findFirst.mockResolvedValue({
      id: 'e-1',
      userId: 'other-user',
      salary: 120000,
      panNumber: 'ABCDE1234F',
      aadhaarNumber: '123456789012',
      bankAccountNumber: '9988776655',
      bankIfsc: 'HDFC0001234',
      bankName: 'HDFC',
      uanNumber: '100200300',
      documents: [{ id: 'doc-1' }],
      user: { id: 'other-user', employeeId: 'EMP-001', name: 'Other', email: 'other@markanthony.in', role: Role.SUPER_ADMIN, teamId: null, team: null },
      department: null,
    });

    await expect(service.findOne('e-1', regularEmployee)).rejects.toThrow(ForbiddenException);
  });

  it('should create employee, initialize 4 leave balances, and record EMPLOYEE_CREATED audit log', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.roleDefinition.findUnique.mockResolvedValue({ id: 'role-emp' });
    prisma.user.create.mockResolvedValue({ id: 'new-user-1' });
    prisma.employee.create.mockResolvedValue({
      id: 'new-emp-1',
      userId: 'new-user-1',
      user: { employeeId: 'EMP-020', email: 'new@markanthony.in', role: Role.EMPLOYEE },
    });
    prisma.leaveBalance.createMany.mockResolvedValue({ count: 4 });

    const created = await service.createEmployee(
      {
        employeeId: 'EMP-020',
        email: 'new@markanthony.in',
        name: 'New Joiner',
        password: 'Password@123',
      },
      hrUser.id,
      {},
    );

    expect(created.id).toBe('new-emp-1');
    expect(prisma.leaveBalance.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ leaveType: 'CASUAL', allocatedDays: 0 }),
          expect.objectContaining({ leaveType: 'SICK', allocatedDays: 0 }),
          expect.objectContaining({ leaveType: 'EARNED', allocatedDays: 0 }),
          expect.objectContaining({ leaveType: 'LOP', allocatedDays: 0 }),
        ]),
      }),
    );
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: 'EMPLOYEE_CREATED' }),
    );
  });

  it('should reject duplicate employee email or employeeId with ConflictException', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.createEmployee(
        {
          employeeId: 'EMP-005',
          email: 'priya.sales@markanthony.in',
          name: 'Duplicate',
          password: 'Password@123',
        },
        hrUser.id,
        {},
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('should forbid a regular employee from updating salary or role', async () => {
    prisma.employee.findFirst.mockResolvedValue({
      id: 'e-5',
      userId: regularEmployee.id,
      user: { id: regularEmployee.id },
    });

    await expect(
      service.updateEmployee('e-5', { salary: 999999 }, regularEmployee, {}),
    ).rejects.toThrow(ForbiddenException);
  });
});
