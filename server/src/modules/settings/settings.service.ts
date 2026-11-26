import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppRole } from '../../core/decorators/roles.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import type { UpdateUserAccessDto } from './dto/update-user-access.dto.js';
import type { UpsertDesignationDto } from './dto/upsert-designation.dto.js';
import type { UpsertOrgUnitDto } from './dto/upsert-org-unit.dto.js';
import type { UpsertShiftDto } from './dto/upsert-shift.dto.js';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ==================== USERS & ACCESS ====================
  async listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        roleId: true,
        employmentStatus: true,
        isArchived: true,
        canImpersonate: true,
        lastLoginAt: true,
        teamId: true,
        team: { select: { id: true, name: true } },
        roleDefinition: { select: { id: true, name: true, displayName: true } },
        employee: {
          select: {
            id: true,
            jobTitle: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { employeeId: 'asc' },
    });
  }

  async updateUserAccess(
    targetUserId: string,
    dto: UpdateUserAccessDto,
    actor: AuthenticatedUser,
    meta: RequestMeta,
  ) {
    const target = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (dto.canImpersonate !== undefined && actor.role !== AppRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only SuperAdmin can grant or revoke impersonation rights');
    }

    if (targetUserId === actor.id && (dto.isArchived === true || dto.employmentStatus === 'ARCHIVED')) {
      throw new BadRequestException('You cannot archive your own active account');
    }

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(dto.employmentStatus !== undefined ? { employmentStatus: dto.employmentStatus } : {}),
        ...(dto.isArchived !== undefined ? { isArchived: dto.isArchived } : {}),
        ...(dto.canImpersonate !== undefined ? { canImpersonate: dto.canImpersonate } : {}),
        ...(dto.teamId !== undefined ? { teamId: dto.teamId } : {}),
      },
      select: {
        id: true,
        employeeId: true,
        email: true,
        name: true,
        role: true,
        roleId: true,
        employmentStatus: true,
        isArchived: true,
        canImpersonate: true,
        teamId: true,
      },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      targetUserId,
      actionType: 'USER_ACCESS_UPDATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: {
        employmentStatus: target.employmentStatus,
        isArchived: target.isArchived,
        canImpersonate: target.canImpersonate,
        teamId: target.teamId,
      },
      newValuePayload: {
        employmentStatus: updated.employmentStatus,
        isArchived: updated.isArchived,
        canImpersonate: updated.canImpersonate,
        teamId: updated.teamId,
      },
    });

    return updated;
  }

  // ==================== DEPARTMENTS ====================
  async listDepartments() {
    return this.prisma.department.findMany({
      include: {
        _count: { select: { employees: true, designations: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(dto: UpsertOrgUnitDto, actorId: string, meta: RequestMeta) {
    const name = dto.name.trim();
    const existing = await this.prisma.department.findUnique({ where: { name } });
    if (existing) {
      throw new ConflictException(`Department "${name}" already exists`);
    }

    const created = await this.prisma.department.create({
      data: { name, description: dto.description?.trim() },
    });

    await this.auditService.log({
      actorUserId: actorId,
      actionType: 'DEPARTMENT_CREATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: { id: created.id, name: created.name },
    });

    return created;
  }

  async updateDepartment(id: string, dto: UpsertOrgUnitDto, actorId: string, meta: RequestMeta) {
    const existing = await this.prisma.department.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Department not found');

    const updated = await this.prisma.department.update({
      where: { id },
      data: { name: dto.name.trim(), description: dto.description?.trim() },
    });

    await this.auditService.log({
      actorUserId: actorId,
      actionType: 'DEPARTMENT_UPDATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: { name: existing.name },
      newValuePayload: { name: updated.name },
    });

    return updated;
  }

  async deleteDepartment(id: string, actorId: string, meta: RequestMeta) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { employees: true } } },
    });
    if (!dept) throw new NotFoundException('Department not found');
    if (dept._count.employees > 0) {
      throw new BadRequestException('Cannot delete department with assigned employees');
    }

    await this.prisma.department.delete({ where: { id } });
    await this.auditService.log({
      actorUserId: actorId,
      actionType: 'DEPARTMENT_DELETED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: { id, name: dept.name },
    });

    return { message: `Department "${dept.name}" deleted` };
  }

  // ==================== TEAMS ====================
  async listTeams() {
    return this.prisma.team.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createTeam(dto: UpsertOrgUnitDto, actorId: string, meta: RequestMeta) {
    const name = dto.name.trim();
    const existing = await this.prisma.team.findUnique({ where: { name } });
    if (existing) {
      throw new ConflictException(`Team "${name}" already exists`);
    }

    const created = await this.prisma.team.create({
      data: { name, description: dto.description?.trim() },
    });

    await this.auditService.log({
      actorUserId: actorId,
      actionType: 'TEAM_CREATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: { id: created.id, name: created.name },
    });

    return created;
  }

  async updateTeam(id: string, dto: UpsertOrgUnitDto, actorId: string, meta: RequestMeta) {
    const existing = await this.prisma.team.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Team not found');

    const updated = await this.prisma.team.update({
      where: { id },
      data: { name: dto.name.trim(), description: dto.description?.trim() },
    });

    await this.auditService.log({
      actorUserId: actorId,
      actionType: 'TEAM_UPDATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: { name: existing.name },
      newValuePayload: { name: updated.name },
    });

    return updated;
  }

  async deleteTeam(id: string, actorId: string, meta: RequestMeta) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!team) throw new NotFoundException('Team not found');
    if (team._count.users > 0) {
      throw new BadRequestException('Cannot delete team with assigned users');
    }

    await this.prisma.team.delete({ where: { id } });
    await this.auditService.log({
      actorUserId: actorId,
      actionType: 'TEAM_DELETED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: { id, name: team.name },
    });

    return { message: `Team "${team.name}" deleted` };
  }

  // ==================== DESIGNATIONS ====================
  async listDesignations() {
    return this.prisma.designation.findMany({
      include: { department: { select: { id: true, name: true } } },
      orderBy: { title: 'asc' },
    });
  }

  async createDesignation(dto: UpsertDesignationDto, actorId: string, meta: RequestMeta) {
    const title = dto.title.trim();
    const existing = await this.prisma.designation.findUnique({ where: { title } });
    if (existing) {
      throw new ConflictException(`Designation "${title}" already exists`);
    }

    const created = await this.prisma.designation.create({
      data: {
        title,
        departmentId: dto.departmentId ?? null,
        description: dto.description?.trim(),
        isActive: dto.isActive ?? true,
      },
      include: { department: { select: { id: true, name: true } } },
    });

    await this.auditService.log({
      actorUserId: actorId,
      actionType: 'DESIGNATION_CREATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: { id: created.id, title: created.title },
    });

    return created;
  }

  async updateDesignation(
    id: string,
    dto: UpsertDesignationDto,
    actorId: string,
    meta: RequestMeta,
  ) {
    const existing = await this.prisma.designation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Designation not found');

    const updated = await this.prisma.designation.update({
      where: { id },
      data: {
        title: dto.title.trim(),
        departmentId: dto.departmentId ?? null,
        description: dto.description?.trim(),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: { department: { select: { id: true, name: true } } },
    });

    await this.auditService.log({
      actorUserId: actorId,
      actionType: 'DESIGNATION_UPDATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: { id: updated.id, title: updated.title },
    });

    return updated;
  }

  async deleteDesignation(id: string, actorId: string, meta: RequestMeta) {
    const existing = await this.prisma.designation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Designation not found');

    await this.prisma.designation.delete({ where: { id } });
    await this.auditService.log({
      actorUserId: actorId,
      actionType: 'DESIGNATION_DELETED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: { id, title: existing.title },
    });

    return { message: `Designation "${existing.title}" deleted` };
  }

  // ==================== SHIFT & GRACE PERIODS ====================
  async listShifts() {
    return this.prisma.shiftSetting.findMany({
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async createShift(dto: UpsertShiftDto, actorId: string, meta: RequestMeta) {
    const name = dto.name.trim();
    const existing = await this.prisma.shiftSetting.findUnique({ where: { name } });
    if (existing) {
      throw new ConflictException(`Shift "${name}" already exists`);
    }

    const created = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.shiftSetting.updateMany({ data: { isDefault: false } });
      }
      return tx.shiftSetting.create({
        data: {
          name,
          startTime: dto.startTime,
          endTime: dto.endTime,
          gracePeriodMinutes: dto.gracePeriodMinutes,
          fullDayHours: dto.fullDayHours,
          halfDayHours: dto.halfDayHours,
          isDefault: dto.isDefault ?? false,
        },
      });
    });

    await this.auditService.log({
      actorUserId: actorId,
      actionType: 'SHIFT_CREATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: { id: created.id, name: created.name, gracePeriodMinutes: created.gracePeriodMinutes },
    });

    return created;
  }

  async updateShift(id: string, dto: UpsertShiftDto, actorId: string, meta: RequestMeta) {
    const existing = await this.prisma.shiftSetting.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Shift setting not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.shiftSetting.updateMany({
          where: { id: { not: id } },
          data: { isDefault: false },
        });
      }
      return tx.shiftSetting.update({
        where: { id },
        data: {
          name: dto.name.trim(),
          startTime: dto.startTime,
          endTime: dto.endTime,
          gracePeriodMinutes: dto.gracePeriodMinutes,
          fullDayHours: dto.fullDayHours,
          halfDayHours: dto.halfDayHours,
          ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault } : {}),
        },
      });
    });

    await this.auditService.log({
      actorUserId: actorId,
      actionType: 'SHIFT_UPDATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: {
        startTime: existing.startTime,
        gracePeriodMinutes: existing.gracePeriodMinutes,
      },
      newValuePayload: {
        startTime: updated.startTime,
        gracePeriodMinutes: updated.gracePeriodMinutes,
      },
    });

    return updated;
  }

  async deleteShift(id: string, actorId: string, meta: RequestMeta) {
    const existing = await this.prisma.shiftSetting.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Shift setting not found');
    if (existing.isDefault) {
      throw new BadRequestException('Cannot delete the default shift. Set another shift as default first.');
    }

    await this.prisma.shiftSetting.delete({ where: { id } });
    await this.auditService.log({
      actorUserId: actorId,
      actionType: 'SHIFT_DELETED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: { id, name: existing.name },
    });

    return { message: `Shift "${existing.name}" deleted` };
  }
}
