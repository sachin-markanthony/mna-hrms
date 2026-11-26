import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import { AppRole, Roles } from '../../core/decorators/roles.decorator.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { UpdateUserAccessDto } from './dto/update-user-access.dto.js';
import { UpsertDesignationDto } from './dto/upsert-designation.dto.js';
import { UpsertOrgUnitDto } from './dto/upsert-org-unit.dto.js';
import { UpsertShiftDto } from './dto/upsert-shift.dto.js';
import { SettingsService } from './settings.service.js';

@ApiTags('Master Settings & Access Control')
@ApiBearerAuth('JWT-auth')
@Roles(AppRole.SUPER_ADMIN, AppRole.HR_ADMIN)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Users & Access
  @Get('users')
  @ApiOperation({ summary: 'List all users with role, team, status, and impersonation flags' })
  listUsers() {
    return this.settingsService.listUsers();
  }

  @Patch('users/:id/access')
  @ApiOperation({ summary: 'Update user status, team, or impersonation access' })
  updateUserAccess(
    @Param('id') id: string,
    @Body() dto: UpdateUserAccessDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settingsService.updateUserAccess(id, dto, actor, this.extractMeta(req));
  }

  // Departments
  @Get('departments')
  @ApiOperation({ summary: 'List all departments with employee & designation counts' })
  listDepartments() {
    return this.settingsService.listDepartments();
  }

  @Post('departments')
  @ApiOperation({ summary: 'Create a department' })
  createDepartment(
    @Body() dto: UpsertOrgUnitDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settingsService.createDepartment(dto, actor.id, this.extractMeta(req));
  }

  @Patch('departments/:id')
  @ApiOperation({ summary: 'Update a department' })
  updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpsertOrgUnitDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settingsService.updateDepartment(id, dto, actor.id, this.extractMeta(req));
  }

  @Delete('departments/:id')
  @ApiOperation({ summary: 'Delete an empty department' })
  deleteDepartment(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settingsService.deleteDepartment(id, actor.id, this.extractMeta(req));
  }

  // Teams
  @Get('teams')
  @ApiOperation({ summary: 'List all teams with user counts' })
  listTeams() {
    return this.settingsService.listTeams();
  }

  @Post('teams')
  @ApiOperation({ summary: 'Create a team' })
  createTeam(
    @Body() dto: UpsertOrgUnitDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settingsService.createTeam(dto, actor.id, this.extractMeta(req));
  }

  @Patch('teams/:id')
  @ApiOperation({ summary: 'Update a team' })
  updateTeam(
    @Param('id') id: string,
    @Body() dto: UpsertOrgUnitDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settingsService.updateTeam(id, dto, actor.id, this.extractMeta(req));
  }

  @Delete('teams/:id')
  @ApiOperation({ summary: 'Delete an empty team' })
  deleteTeam(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settingsService.deleteTeam(id, actor.id, this.extractMeta(req));
  }

  // Designations
  @Get('designations')
  @ApiOperation({ summary: 'List all job designations' })
  listDesignations() {
    return this.settingsService.listDesignations();
  }

  @Post('designations')
  @ApiOperation({ summary: 'Create a job designation' })
  createDesignation(
    @Body() dto: UpsertDesignationDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settingsService.createDesignation(dto, actor.id, this.extractMeta(req));
  }

  @Patch('designations/:id')
  @ApiOperation({ summary: 'Update a job designation' })
  updateDesignation(
    @Param('id') id: string,
    @Body() dto: UpsertDesignationDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settingsService.updateDesignation(id, dto, actor.id, this.extractMeta(req));
  }

  @Delete('designations/:id')
  @ApiOperation({ summary: 'Delete a job designation' })
  deleteDesignation(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settingsService.deleteDesignation(id, actor.id, this.extractMeta(req));
  }

  // Shifts & Grace Periods
  @Get('shifts')
  @ApiOperation({ summary: 'List all shift schedules and grace period rules' })
  listShifts() {
    return this.settingsService.listShifts();
  }

  @Post('shifts')
  @ApiOperation({ summary: 'Create a shift schedule with grace period' })
  createShift(
    @Body() dto: UpsertShiftDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settingsService.createShift(dto, actor.id, this.extractMeta(req));
  }

  @Patch('shifts/:id')
  @ApiOperation({ summary: 'Update shift timing or grace period minutes' })
  updateShift(
    @Param('id') id: string,
    @Body() dto: UpsertShiftDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settingsService.updateShift(id, dto, actor.id, this.extractMeta(req));
  }

  @Delete('shifts/:id')
  @ApiOperation({ summary: 'Delete a non-default shift schedule' })
  deleteShift(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settingsService.deleteShift(id, actor.id, this.extractMeta(req));
  }

  private extractMeta(req: Request): RequestMeta {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
