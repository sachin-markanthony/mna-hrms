import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../core/decorators/permissions.decorator.js';
import { AppRole, Roles } from '../../core/decorators/roles.decorator.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { GeneratePayrollDto } from './dto/generate-payroll.dto.js';
import { TogglePayslipVisibilityDto } from './dto/toggle-payslip-visibility.dto.js';
import { UpdatePayslipDto } from './dto/update-payslip.dto.js';
import { PayrollService } from './payroll.service.js';

@ApiTags('Payroll & Payslips')
@ApiBearerAuth('JWT-auth')
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('my-payslips')
  @ApiOperation({ summary: 'Get locked/paid payslips for the currently logged-in employee' })
  getMyPayslips(@CurrentUser() user: AuthenticatedUser) {
    return this.payrollService.getMyPayslips(user.id);
  }

  @Get('my-official-letters')
  @ApiOperation({ summary: 'Get issued official letters (offer letters, etc.) for the logged-in employee' })
  getMyOfficialLetters(@CurrentUser() user: AuthenticatedUser) {
    return this.payrollService.getMyOfficialLetters(user);
  }

  @RequirePermissions('payroll:run')
  @Get('runs')
  @ApiOperation({ summary: 'List all monthly payroll runs' })
  listRuns() {
    return this.payrollService.listRuns();
  }

  @RequirePermissions('payroll:run')
  @Get('runs/:id')
  @ApiOperation({ summary: 'Get detailed payroll run with employee payslips' })
  getRun(@Param('id') id: string) {
    return this.payrollService.getRunById(id);
  }

  @RequirePermissions('payroll:run')
  @Post('runs/generate')
  @ApiOperation({ summary: 'Generate or recalculate a DRAFT payroll run from attendance LOP logs' })
  generateRun(
    @Body() dto: GeneratePayrollDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.payrollService.generateRun(dto, actor.id, this.extractMeta(req));
  }

  @RequirePermissions('payroll:salary_manage')
  @Patch('payslips/:id')
  @ApiOperation({ summary: 'Adjust bonus, deductions, or LOP days on a DRAFT payslip' })
  updatePayslip(
    @Param('id') id: string,
    @Body() dto: UpdatePayslipDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.payrollService.updatePayslip(id, dto, actor.id, this.extractMeta(req));
  }

  @Roles(AppRole.SUPER_ADMIN)
  @Patch('runs/:id/lock')
  @ApiOperation({ summary: 'Lock a DRAFT payroll run (SuperAdmin only)' })
  lockRun(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.payrollService.lockRun(id, actor.id, this.extractMeta(req));
  }

  @RequirePermissions('payroll:run')
  @Patch('runs/:id/pay')
  @ApiOperation({ summary: 'Mark a LOCKED payroll run as PAID' })
  markPaid(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.payrollService.markPaid(id, actor.id, this.extractMeta(req));
  }

  @RequirePermissions('payroll:run')
  @Patch('runs/:id/visibility')
  @ApiOperation({ summary: 'Release or hide LOCKED/PAID salary slips in the employee portal (HR Admin / SuperAdmin)' })
  setVisibility(
    @Param('id') id: string,
    @Body() dto: TogglePayslipVisibilityDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.payrollService.setPayslipVisibility(id, dto.visible, actor.id, this.extractMeta(req));
  }

  private extractMeta(req: Request): RequestMeta {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
