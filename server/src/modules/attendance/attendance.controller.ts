import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import { Public } from '../../core/decorators/public.decorator.js';
import { AppRole, Roles } from '../../core/decorators/roles.decorator.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { AttendanceService } from './attendance.service.js';
import { HardwarePunchDto } from './dto/hardware-punch.dto.js';
import { QueryAttendanceDto } from './dto/query-attendance.dto.js';
import { RegularizationDecisionDto } from './dto/regularization-decision.dto.js';
import { RegularizeAttendanceDto } from './dto/regularize-attendance.dto.js';
import { SitePunchDto } from './dto/site-punch.dto.js';

@ApiTags('Attendance & Site Visits')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Public()
  @Post('hardware-punch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Office facial scan terminal webhook (Tier 1 append-only)' })
  recordHardwarePunch(@Body() dto: HardwarePunchDto, @Req() req: Request) {
    return this.attendanceService.recordHardwarePunch(dto, this.extractMeta(req));
  }

  @ApiBearerAuth('JWT-auth')
  @Post('site-punch')
  @ApiOperation({ summary: 'CRM mobile app GPS site-visit punch (validates <= 300m geofence)' })
  recordSiteVisitPunch(
    @Body() dto: SitePunchDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attendanceService.recordSiteVisitPunch(user, dto);
  }

  @ApiBearerAuth('JWT-auth')
  @Get('raw-logs')
  @ApiOperation({ summary: 'List immutable Tier 1 attendance raw logs scoped by role' })
  getRawLogs(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryAttendanceDto,
  ) {
    return this.attendanceService.getRawLogs(user, query);
  }

  @ApiBearerAuth('JWT-auth')
  @Get('master')
  @ApiOperation({ summary: 'List reconciled daily AttendanceMaster records scoped by role' })
  getMasterRecords(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryAttendanceDto,
  ) {
    return this.attendanceService.getMasterRecords(user, query);
  }

  @ApiBearerAuth('JWT-auth')
  @Get('site-visits')
  @ApiOperation({ summary: 'List field sales GPS site visits scoped by role' })
  getSiteVisits(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryAttendanceDto,
  ) {
    return this.attendanceService.getSiteVisits(user, query);
  }

  @ApiBearerAuth('JWT-auth')
  @Get('regularizations')
  @ApiOperation({ summary: 'List attendance regularization requests scoped by role' })
  getRegularizations(@CurrentUser() user: AuthenticatedUser) {
    return this.attendanceService.getRegularizations(user);
  }

  @ApiBearerAuth('JWT-auth')
  @Post('regularize')
  @ApiOperation({ summary: 'Submit a monthly attendance regularization request' })
  requestRegularization(
    @Body() dto: RegularizeAttendanceDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.attendanceService.requestRegularization(user, dto, this.extractMeta(req));
  }

  @ApiBearerAuth('JWT-auth')
  @Roles(AppRole.SUPER_ADMIN, AppRole.HR_ADMIN, AppRole.HR_COORDINATOR, AppRole.TEAM_LEADER)
  @Patch('regularize/:id/decision')
  @ApiOperation({ summary: 'Approve or reject an attendance regularization request' })
  decideRegularization(
    @Param('id') id: string,
    @Body() dto: RegularizationDecisionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.attendanceService.decideRegularization(id, user, dto, this.extractMeta(req));
  }

  @ApiBearerAuth('JWT-auth')
  @Roles(AppRole.SUPER_ADMIN, AppRole.HR_ADMIN)
  @Post('reconcile')
  @ApiQuery({ name: 'date', required: false, example: '2026-11-25' })
  @ApiOperation({ summary: 'Manually trigger daily attendance reconciliation (HR Admin / SuperAdmin)' })
  reconcile(@Query('date') date?: string) {
    return this.attendanceService.reconcileAllForDate(date);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles(AppRole.SUPER_ADMIN, AppRole.HR_ADMIN)
  @Post('latecomer-scan')
  @ApiOperation({ summary: 'Manually trigger 09:45 AM latecomer scan (HR Admin / SuperAdmin)' })
  runLatecomerScan() {
    return this.attendanceService.runLatecomerScan();
  }

  private extractMeta(req: Request): RequestMeta {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
