import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AppRole } from '../../core/decorators/roles.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { AssignUserRoleDto } from './dto/assign-user-role.dto.js';
import type { CreateRoleDto } from './dto/create-role.dto.js';
import type { UpdateRoleDto } from './dto/update-role.dto.js';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAllRoles() {
    return this.prisma.roleDefinition.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { key: 'asc' }],
    });
  }

  async createRole(dto: CreateRoleDto, actorUserId: string, meta: RequestMeta) {
    const existing = await this.prisma.roleDefinition.findUnique({
      where: { name: dto.name },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(`Role "${dto.name}" already exists`);
    }

    const permissionIds = dto.permissionIds ?? [];
    if (permissionIds.length > 0) {
      const count = await this.prisma.permission.count({
        where: { id: { in: permissionIds } },
      });
      if (count !== permissionIds.length) {
        throw new BadRequestException('One or more permission IDs are invalid');
      }
    }

    const role = await this.prisma.roleDefinition.create({
      data: {
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        isSystem: false,
        permissions:
          permissionIds.length > 0
            ? {
                create: permissionIds.map((permissionId) => ({ permissionId })),
              }
            : undefined,
      },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    await this.auditService.log({
      actorUserId,
      actionType: 'ROLE_CREATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        roleId: role.id,
        name: role.name,
        permissionCount: permissionIds.length,
      },
    });

    return role;
  }

  async updateRole(
    roleId: string,
    dto: UpdateRoleDto,
    actorUserId: string,
    meta: RequestMeta,
  ) {
    const role = await this.prisma.roleDefinition.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const updated = await this.prisma.roleDefinition.update({
      where: { id: roleId },
      data: {
        displayName: dto.displayName,
        description: dto.description,
      },
    });

    await this.auditService.log({
      actorUserId,
      actionType: 'ROLE_UPDATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: { displayName: role.displayName, description: role.description },
      newValuePayload: { displayName: updated.displayName, description: updated.description },
    });

    return updated;
  }

  async syncPermissions(
    roleId: string,
    permissionIds: string[],
    actorUserId: string,
    meta: RequestMeta,
  ) {
    const role = await this.prisma.roleDefinition.findUnique({
      where: { id: roleId },
      include: { permissions: { select: { permissionId: true } } },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.name === AppRole.SUPER_ADMIN) {
      throw new ForbiddenException('SUPER_ADMIN role permissions cannot be restricted');
    }

    if (permissionIds.length > 0) {
      const count = await this.prisma.permission.count({
        where: { id: { in: permissionIds } },
      });
      if (count !== permissionIds.length) {
        throw new BadRequestException('One or more permission IDs are invalid');
      }
    }

    const previousIds = role.permissions.map((p) => p.permissionId);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } });
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
        });
      }
      return tx.roleDefinition.findUnique({
        where: { id: roleId },
        include: { permissions: { include: { permission: true } } },
      });
    });

    await this.auditService.log({
      actorUserId,
      actionType: 'ROLE_PERMISSIONS_UPDATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: { roleId, permissionIds: previousIds },
      newValuePayload: { roleId, permissionIds },
    });

    return updated;
  }

  async assignRoleToUser(
    dto: AssignUserRoleDto,
    actorUserId: string,
    meta: RequestMeta,
  ) {
    const [user, role] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: dto.userId } }),
      this.prisma.roleDefinition.findUnique({ where: { id: dto.roleId } }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const enumRole = Object.values(Role).includes(role.name as Role)
      ? (role.name as Role)
      : user.role;

    const updated = await this.prisma.user.update({
      where: { id: dto.userId },
      data: {
        roleId: role.id,
        role: enumRole,
      },
      select: {
        id: true,
        employeeId: true,
        email: true,
        name: true,
        role: true,
        roleId: true,
      },
    });

    await this.auditService.log({
      actorUserId,
      targetUserId: user.id,
      actionType: 'USER_ROLE_ASSIGNED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: { role: user.role, roleId: user.roleId },
      newValuePayload: { role: updated.role, roleId: updated.roleId },
    });

    return updated;
  }

  async deleteRole(roleId: string, actorUserId: string, meta: RequestMeta) {
    const role = await this.prisma.roleDefinition.findUnique({
      where: { id: roleId },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new ForbiddenException('System roles cannot be deleted');
    }

    if (role._count.users > 0) {
      throw new BadRequestException(
        'Cannot delete a role that is still assigned to users. Reassign users first.',
      );
    }

    await this.prisma.roleDefinition.delete({ where: { id: roleId } });

    await this.auditService.log({
      actorUserId,
      actionType: 'ROLE_DELETED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      oldValuePayload: { roleId: role.id, name: role.name },
    });

    return { message: `Role "${role.name}" deleted successfully` };
  }
}
