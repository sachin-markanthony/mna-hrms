import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../core/decorators/permissions.decorator.js';
import { AppRole, Roles } from '../../core/decorators/roles.decorator.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { AssignUserRoleDto } from './dto/assign-user-role.dto.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { SyncRolePermissionsDto } from './dto/sync-role-permissions.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { RolesService } from './roles.service.js';

@ApiTags('Roles & Permissions')
@ApiBearerAuth('JWT-auth')
@Roles(AppRole.SUPER_ADMIN)
@RequirePermissions('roles:manage')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles with assigned permissions and user counts' })
  findAllRoles() {
    return this.rolesService.findAllRoles();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List all available granular permissions across modules' })
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Post()
  @ApiOperation({ summary: 'Create a custom role (SuperAdmin only)' })
  createRole(
    @Body() dto: CreateRoleDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.rolesService.createRole(dto, actor.id, this.extractMeta(req));
  }

  @Patch('assign-user')
  @ApiOperation({ summary: 'Assign a role to a user (SuperAdmin only)' })
  assignRoleToUser(
    @Body() dto: AssignUserRoleDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.rolesService.assignRoleToUser(dto, actor.id, this.extractMeta(req));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role metadata (SuperAdmin only)' })
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.rolesService.updateRole(id, dto, actor.id, this.extractMeta(req));
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Replace/sync permissions assigned to a role (SuperAdmin only)' })
  syncPermissions(
    @Param('id') id: string,
    @Body() dto: SyncRolePermissionsDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.rolesService.syncPermissions(
      id,
      dto.permissionIds,
      actor.id,
      this.extractMeta(req),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a custom role (SuperAdmin only)' })
  deleteRole(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.rolesService.deleteRole(id, actor.id, this.extractMeta(req));
  }

  private extractMeta(req: Request): RequestMeta {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
