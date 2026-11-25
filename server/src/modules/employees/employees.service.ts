import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EmploymentStatus,
  LeaveType,
  Prisma,
  Role,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppRole } from '../../core/decorators/roles.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import type { CreateEmployeeDto } from './dto/create-employee.dto.js';
import type { QueryEmployeesDto } from './dto/query-employees.dto.js';
import type { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import type { UploadDocumentDto } from './dto/upload-document.dto.js';

const DEFAULT_LEAVE_ALLOCATIONS: Array<{ leaveType: LeaveType; days: number }> = [
  { leaveType: LeaveType.CASUAL, days: 12 },
  { leaveType: LeaveType.SICK, days: 8 },
  { leaveType: LeaveType.EARNED, days: 15 },
  { leaveType: LeaveType.LOP, days: 0 },
];

const EMPLOYEE_INCLUDE = {
  department: { select: { id: true, name: true } },
  documents: { orderBy: { createdAt: 'desc' } },
  user: {
    select: {
      id: true,
      employeeId: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      employmentStatus: true,
      dateOfJoining: true,
      isArchived: true,
      teamId: true,
      team: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.EmployeeInclude;

type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  include: typeof EMPLOYEE_INCLUDE;
}>;

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getDirectoryMeta() {
    const [departments, teams] = await Promise.all([
      this.prisma.department.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.team.findMany({ orderBy: { name: 'asc' } }),
    ]);
    return { departments, teams };
  }

  /**
   * Role-scoped directory listing:
   * - SUPER_ADMIN, HR_ADMIN, HR_COORDINATOR: all active employees
   * - TEAM_LEADER: team members + self
   * - EMPLOYEE: public directory cards
   * Salary & KYC numbers are strictly masked unless SUPER_ADMIN, HR_ADMIN, or self.
   */
  async findAll(currentUser: AuthenticatedUser, query: QueryEmployeesDto) {
    const scopeWhere = await this.buildDirectoryWhere(currentUser);
    const search = query.search?.trim();

    const where: Prisma.EmployeeWhereInput = {
      ...scopeWhere,
      user: {
        isArchived: false,
        ...(scopeWhere.user as Prisma.UserWhereInput | undefined),
        ...(query.teamId ? { teamId: query.teamId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { employeeId: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
    };

    const rows = await this.prisma.employee.findMany({
      where,
      include: EMPLOYEE_INCLUDE,
      orderBy: { user: { employeeId: 'asc' } },
    });

    return rows.map((emp) => this.sanitizeEmployee(emp, currentUser));
  }

  async getMyProfile(userId: string, currentUser: AuthenticatedUser) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: EMPLOYEE_INCLUDE,
    });
    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }
    return this.sanitizeEmployee(employee, currentUser);
  }

  async findOne(id: string, currentUser: AuthenticatedUser) {
    const employee = await this.prisma.employee.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: EMPLOYEE_INCLUDE,
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.assertCanViewEmployee(employee, currentUser);
    return this.sanitizeEmployee(employee, currentUser);
  }

  async createEmployee(
    dto: CreateEmployeeDto,
    actorUserId: string,
    meta: RequestMeta,
  ) {
    const normalizedEmail = dto.email.toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { employeeId: dto.employeeId }],
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Employee with this email or employee ID already exists');
    }

    const targetRole = (dto.role ?? AppRole.EMPLOYEE) as unknown as Role;
    const roleDef = await this.prisma.roleDefinition.findUnique({
      where: { name: targetRole },
      select: { id: true },
    });

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const currentYear = new Date().getUTCFullYear();

    const created = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          employeeId: dto.employeeId,
          email: normalizedEmail,
          name: dto.name,
          phone: dto.phone,
          passwordHash,
          role: targetRole,
          roleId: roleDef?.id,
          teamId: dto.teamId,
          dateOfJoining: dto.hireDate ? new Date(dto.hireDate) : new Date(),
          employmentStatus: EmploymentStatus.ACTIVE,
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          departmentId: dto.departmentId,
          jobTitle: dto.jobTitle,
          hireDate: dto.hireDate ? new Date(dto.hireDate) : new Date(),
          salary: dto.salary,
          gender: dto.gender,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          bloodGroup: dto.bloodGroup,
          address: dto.address,
          emergencyContactName: dto.emergencyContactName,
          emergencyContactPhone: dto.emergencyContactPhone,
          bankAccountNumber: dto.bankAccountNumber,
          bankIfsc: dto.bankIfsc,
          bankName: dto.bankName,
          panNumber: dto.panNumber,
          aadhaarNumber: dto.aadhaarNumber,
          uanNumber: dto.uanNumber,
        },
        include: EMPLOYEE_INCLUDE,
      });

      // Automatically initialize annual leave balances so Leave section is synced immediately
      await tx.leaveBalance.createMany({
        data: DEFAULT_LEAVE_ALLOCATIONS.map((item) => ({
          userId: user.id,
          leaveType: item.leaveType,
          year: currentYear,
          allocatedDays: item.days,
          usedDays: 0,
          remainingDays: item.days,
        })),
        skipDuplicates: true,
      });

      return employee;
    });

    await this.auditService.log({
      actorUserId,
      targetUserId: created.userId,
      actionType: 'EMPLOYEE_CREATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        employeeId: created.user.employeeId,
        email: created.user.email,
        role: created.user.role,
      },
    });

    return created;
  }

  async updateEmployee(
    id: string,
    dto: UpdateEmployeeDto,
    currentUser: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: EMPLOYEE_INCLUDE,
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const isHrOrAdmin =
      currentUser.role === AppRole.SUPER_ADMIN ||
      currentUser.role === AppRole.HR_ADMIN;
    const isSelf = employee.userId === currentUser.id;

    if (!isHrOrAdmin && !isSelf) {
      throw new ForbiddenException('You do not have permission to update this employee');
    }

    if (
      !isHrOrAdmin &&
      (dto.salary !== undefined ||
        dto.role !== undefined ||
        dto.departmentId !== undefined ||
        dto.teamId !== undefined ||
        dto.jobTitle !== undefined)
    ) {
      throw new ForbiddenException(
        'Only HR Admin or SuperAdmin can modify role, department, team, job title, or salary',
      );
    }

    let roleIdUpdate: string | undefined;
    if (dto.role) {
      const roleDef = await this.prisma.roleDefinition.findUnique({
        where: { name: dto.role },
        select: { id: true },
      });
      roleIdUpdate = roleDef?.id;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (
        dto.name !== undefined ||
        dto.phone !== undefined ||
        dto.role !== undefined ||
        dto.teamId !== undefined
      ) {
        await tx.user.update({
          where: { id: employee.userId },
          data: {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
            ...(dto.role !== undefined ? { role: dto.role as unknown as Role } : {}),
            ...(roleIdUpdate ? { roleId: roleIdUpdate } : {}),
            ...(dto.teamId !== undefined ? { teamId: dto.teamId } : {}),
          },
        });
      }

      return tx.employee.update({
        where: { id: employee.id },
        data: {
          ...(dto.departmentId !== undefined ? { departmentId: dto.departmentId } : {}),
          ...(dto.jobTitle !== undefined ? { jobTitle: dto.jobTitle } : {}),
          ...(dto.salary !== undefined ? { salary: dto.salary } : {}),
          ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
          ...(dto.dateOfBirth !== undefined ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}),
          ...(dto.bloodGroup !== undefined ? { bloodGroup: dto.bloodGroup } : {}),
          ...(dto.address !== undefined ? { address: dto.address } : {}),
          ...(dto.emergencyContactName !== undefined
            ? { emergencyContactName: dto.emergencyContactName }
            : {}),
          ...(dto.emergencyContactPhone !== undefined
            ? { emergencyContactPhone: dto.emergencyContactPhone }
            : {}),
          ...(dto.bankAccountNumber !== undefined
            ? { bankAccountNumber: dto.bankAccountNumber }
            : {}),
          ...(dto.bankIfsc !== undefined ? { bankIfsc: dto.bankIfsc } : {}),
          ...(dto.bankName !== undefined ? { bankName: dto.bankName } : {}),
          ...(dto.panNumber !== undefined ? { panNumber: dto.panNumber } : {}),
          ...(dto.aadhaarNumber !== undefined ? { aadhaarNumber: dto.aadhaarNumber } : {}),
          ...(dto.uanNumber !== undefined ? { uanNumber: dto.uanNumber } : {}),
        },
        include: EMPLOYEE_INCLUDE,
      });
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      targetUserId: employee.userId,
      actionType: 'EMPLOYEE_UPDATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        updatedFields: Object.keys(dto),
      },
    });

    return this.sanitizeEmployee(updated, currentUser);
  }

  async archiveEmployee(id: string, actorUserId: string, meta: RequestMeta) {
    const employee = await this.prisma.employee.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: { user: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.userId === actorUserId) {
      throw new ForbiddenException('You cannot archive your own account');
    }

    await this.prisma.user.update({
      where: { id: employee.userId },
      data: {
        isArchived: true,
        employmentStatus: EmploymentStatus.ARCHIVED,
        refreshTokenHash: null,
      },
    });

    await this.auditService.log({
      actorUserId,
      targetUserId: employee.userId,
      actionType: 'EMPLOYEE_ARCHIVED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { message: `Employee ${employee.user.employeeId} archived successfully` };
  }

  async addDocument(
    id: string,
    dto: UploadDocumentDto,
    currentUser: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { OR: [{ id }, { userId: id }] },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const isHrOrAdmin =
      currentUser.role === AppRole.SUPER_ADMIN ||
      currentUser.role === AppRole.HR_ADMIN;
    if (!isHrOrAdmin && employee.userId !== currentUser.id) {
      throw new ForbiddenException('You can only upload KYC documents to your own vault');
    }

    const doc = await this.prisma.employeeDocument.create({
      data: {
        employeeId: employee.id,
        docType: dto.docType,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        isVerified: false,
      },
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      targetUserId: employee.userId,
      actionType: 'DOCUMENT_UPLOADED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: { docId: doc.id, docType: doc.docType, fileName: doc.fileName },
    });

    return doc;
  }

  async verifyDocument(
    docId: string,
    currentUser: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    const doc = await this.prisma.employeeDocument.findUnique({
      where: { id: docId },
      include: { employee: { select: { userId: true } } },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    const updated = await this.prisma.employeeDocument.update({
      where: { id: docId },
      data: {
        isVerified: true,
        verifiedById: currentUser.id,
        verifiedAt: new Date(),
      },
    });

    await this.auditService.log({
      actorUserId: currentUser.id,
      targetUserId: doc.employee.userId,
      actionType: 'DOCUMENT_VERIFIED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: { docId: doc.id, docType: doc.docType },
    });

    return updated;
  }

  async getQrBadge(id: string, currentUser: AuthenticatedUser) {
    const employee = await this.prisma.employee.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: EMPLOYEE_INCLUDE,
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.assertCanViewEmployee(employee, currentUser);

    return {
      employeeId: employee.user.employeeId,
      name: employee.user.name,
      email: employee.user.email,
      phone: employee.user.phone,
      department: employee.department?.name ?? null,
      team: employee.user.team?.name ?? null,
      jobTitle: employee.jobTitle,
      bloodGroup: employee.bloodGroup,
      emergencyContactName: employee.emergencyContactName,
      emergencyContactPhone: employee.emergencyContactPhone,
      vCard: [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${employee.user.name}`,
        `ORG:Mark Anthony Realty;${employee.department?.name ?? ''}`,
        `TITLE:${employee.jobTitle ?? ''}`,
        `TEL:${employee.user.phone ?? ''}`,
        `EMAIL:${employee.user.email}`,
        'END:VCARD',
      ].join('\n'),
    };
  }

  private async buildDirectoryWhere(
    currentUser: AuthenticatedUser,
  ): Promise<Prisma.EmployeeWhereInput> {
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
          user: {
            OR: [{ id: currentUser.id }, { teamId: actor.teamId }],
          },
        };
      }
      return { userId: currentUser.id };
    }

    // Standard EMPLOYEE sees public directory cards (sensitive fields masked below)
    return {};
  }

  private async assertCanViewEmployee(
    employee: EmployeeWithRelations,
    currentUser: AuthenticatedUser,
  ) {
    if (
      currentUser.role === AppRole.SUPER_ADMIN ||
      currentUser.role === AppRole.HR_ADMIN ||
      currentUser.role === AppRole.HR_COORDINATOR ||
      employee.userId === currentUser.id
    ) {
      return;
    }

    if (currentUser.role === AppRole.TEAM_LEADER) {
      const actor = await this.prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { teamId: true },
      });
      if (actor?.teamId && actor.teamId === employee.user.teamId) {
        return;
      }
    }
  }

  /**
   * Security Guardrail: Compensation & KYC data restricted to SUPER_ADMIN, HR_ADMIN, or self.
   */
  private sanitizeEmployee(
    emp: EmployeeWithRelations,
    currentUser: AuthenticatedUser,
  ) {
    const canViewSensitive =
      currentUser.role === AppRole.SUPER_ADMIN ||
      currentUser.role === AppRole.HR_ADMIN ||
      emp.userId === currentUser.id;

    if (canViewSensitive) {
      return {
        ...emp,
        aadhaarNumber: emp.aadhaarNumber
          ? this.maskValue(emp.aadhaarNumber)
          : null,
      };
    }

    return {
      ...emp,
      salary: null,
      bankAccountNumber: null,
      bankIfsc: null,
      bankName: null,
      panNumber: null,
      aadhaarNumber: null,
      uanNumber: null,
      documents: [],
    };
  }

  private maskValue(value: string) {
    if (value.length <= 4) return 'XXXX';
    return `${'X'.repeat(value.length - 4)}${value.slice(-4)}`;
  }
}
