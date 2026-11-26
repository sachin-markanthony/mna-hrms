import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../core/decorators/permissions.decorator.js';
import { AppRole, Roles } from '../../core/decorators/roles.decorator.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { QueryEmployeesDto } from './dto/query-employees.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { UploadDocumentDto } from './dto/upload-document.dto.js';
import { EmployeesService } from './employees.service.js';

@ApiTags('Employees & Document Vault')
@ApiBearerAuth('JWT-auth')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('meta')
  @ApiOperation({ summary: 'List departments and teams for employee directory filters & forms' })
  getDirectoryMeta() {
    return this.employeesService.getDirectoryMeta();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user full employee dossier & KYC documents' })
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.employeesService.getMyProfile(user.id, user);
  }

  @Get()
  @ApiOperation({ summary: 'List employee directory scoped by role (with salary/KYC confidentiality)' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryEmployeesDto,
  ) {
    return this.employeesService.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee dossier by employee ID or user ID' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.findOne(id, user);
  }

  @Get(':id/qr')
  @ApiOperation({ summary: 'Get digital ID badge & vCard payload for an employee' })
  getQrBadge(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.getQrBadge(id, user);
  }

  @Roles(AppRole.SUPER_ADMIN, AppRole.HR_ADMIN)
  @RequirePermissions('employees:manage_all')
  @Post()
  @ApiOperation({
    summary:
      'Provision a new employee (creates User, Employee dossier, and initializes annual LeaveBalances)',
  })
  createEmployee(
    @Body() dto: CreateEmployeeDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.employeesService.createEmployee(dto, actor.id, this.extractMeta(req));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee dossier (HR/SuperAdmin: all fields; Self: personal contact fields)' })
  updateEmployee(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.employeesService.updateEmployee(id, dto, user, this.extractMeta(req));
  }

  @Roles(AppRole.SUPER_ADMIN, AppRole.HR_ADMIN)
  @RequirePermissions('employees:manage_all')
  @Patch(':id/archive')
  @ApiOperation({ summary: 'Soft-archive an employee account (HR Admin / SuperAdmin)' })
  archiveEmployee(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.employeesService.archiveEmployee(id, actor.id, this.extractMeta(req));
  }

  @Post(':id/documents')
  @ApiOperation({ summary: 'Register/upload a KYC document into the employee vault' })
  addDocument(
    @Param('id') id: string,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.employeesService.addDocument(id, dto, user, this.extractMeta(req));
  }

  @Roles(AppRole.SUPER_ADMIN, AppRole.HR_ADMIN, AppRole.HR_COORDINATOR)
  @Patch('documents/:docId/verify')
  @ApiOperation({ summary: 'Verify an employee KYC document (HR / SuperAdmin)' })
  verifyDocument(
    @Param('docId') docId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.employeesService.verifyDocument(docId, user, this.extractMeta(req));
  }

  private extractMeta(req: Request): RequestMeta {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
