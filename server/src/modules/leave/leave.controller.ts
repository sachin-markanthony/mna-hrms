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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import { AppRole, Roles } from '../../core/decorators/roles.decorator.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { ApplyLeaveDto } from './dto/apply-leave.dto.js';
import { InitializeBalancesDto } from './dto/initialize-balances.dto.js';
import { LeaveDecisionDto } from './dto/leave-decision.dto.js';
import { QueryLeaveDto } from './dto/query-leave.dto.js';
import { LeaveService } from './leave.service.js';

@ApiTags('Leave Management')
@ApiBearerAuth('JWT-auth')
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get('balances/me')
  @ApiOperation({ summary: 'Get current user leave balances (Casual, Sick, Earned, LOP)' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getMyBalances(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year') year?: string,
  ) {
    const parsedYear = year ? Number(year) : undefined;
    return this.leaveService.getMyBalances(user.id, parsedYear);
  }

  @Roles(AppRole.SUPER_ADMIN, AppRole.HR_ADMIN)
  @Post('balances/initialize')
  @ApiOperation({ summary: 'Initialize or update annual leave balances for an employee (HR / SuperAdmin)' })
  initializeBalances(
    @Body() dto: InitializeBalancesDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.leaveService.initializeBalances(dto, actor.id, this.extractMeta(req));
  }

  @Get('requests')
  @ApiOperation({
    summary:
      'List leave requests scoped by role (Employee: self, Team Lead: team + self, HR/SuperAdmin: all)',
  })
  getVisibleRequests(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryLeaveDto,
  ) {
    return this.leaveService.getVisibleRequests(user, query);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get team/org leave calendar for a given month and year' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getTeamCalendar(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.leaveService.getTeamCalendar(
      user,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Post('requests')
  @ApiOperation({ summary: 'Apply for leave (Casual, Sick, Earned, or LOP)' })
  applyLeave(
    @Body() dto: ApplyLeaveDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.leaveService.applyLeave(user, dto, this.extractMeta(req));
  }

  @Roles(AppRole.TEAM_LEADER, AppRole.SUPER_ADMIN)
  @Patch('requests/:id/team-lead-decision')
  @ApiOperation({ summary: 'Submit Team Lead approval/rejection for a team member leave request' })
  submitTeamLeadDecision(
    @Param('id') id: string,
    @Body() dto: LeaveDecisionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.leaveService.submitTeamLeadDecision(id, user, dto, this.extractMeta(req));
  }

  @Roles(AppRole.HR_ADMIN, AppRole.HR_COORDINATOR, AppRole.SUPER_ADMIN)
  @Patch('requests/:id/hr-decision')
  @ApiOperation({ summary: 'Submit HR approval/rejection for an employee leave request' })
  submitHrDecision(
    @Param('id') id: string,
    @Body() dto: LeaveDecisionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.leaveService.submitHrDecision(id, user, dto, this.extractMeta(req));
  }

  @Patch('requests/:id/cancel')
  @ApiOperation({ summary: 'Cancel own pending leave request' })
  cancelLeave(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.leaveService.cancelLeave(id, user, this.extractMeta(req));
  }

  private extractMeta(req: Request): RequestMeta {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
