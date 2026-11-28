import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { OffboardingStatus } from '@prisma/client';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import {
  ApproveOffboardingDto,
  CreateOffboardingDto,
  TerminateEmployeeDto,
  UpdateNocDto,
} from './dto/offboarding.dto.js';
import { OffboardingService } from './offboarding.service.js';

@ApiTags('Offboarding & NOC Clearance')
@ApiBearerAuth('JWT-auth')
@Controller('offboarding')
export class OffboardingController {
  constructor(private readonly offboardingService: OffboardingService) {}

  @Get()
  @ApiOperation({ summary: 'List offboarding requests (HR sees all; employee sees self)' })
  listOffboardings(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: OffboardingStatus,
  ) {
    return this.offboardingService.listOffboardings(user, status);
  }

  @Post()
  @ApiOperation({ summary: 'Initiate resignation / offboarding (30-day notice period)' })
  initiateOffboarding(
    @Body() dto: CreateOffboardingDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.offboardingService.initiateOffboarding(dto, user, this.extractMeta(req));
  }

  @Post('terminate')
  @ApiOperation({ summary: 'Directly terminate an employee and send termination email (HR/Admin)' })
  terminateEmployee(
    @Body() dto: TerminateEmployeeDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.offboardingService.terminateEmployee(dto, user, this.extractMeta(req));
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve resignation or adjust Last Working Day (HR/Admin)' })
  approveResignation(
    @Param('id') id: string,
    @Body() dto: ApproveOffboardingDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.offboardingService.approveResignation(id, dto, user, this.extractMeta(req));
  }

  @Patch(':id/noc')
  @ApiOperation({ summary: 'Update Assets or Experience Letter NOC checkpoint' })
  updateNoc(
    @Param('id') id: string,
    @Body() dto: UpdateNocDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.offboardingService.updateNoc(id, dto, user, this.extractMeta(req));
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete offboarding after Assets clearance and deactivate access' })
  completeOffboarding(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.offboardingService.completeOffboarding(id, user, this.extractMeta(req));
  }

  @Patch(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw / cancel an active resignation request' })
  withdrawOffboarding(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.offboardingService.withdrawOffboarding(id, user, this.extractMeta(req));
  }

  private extractMeta(req: Request): RequestMeta {
    return {
      ipAddress: (req.ip as string) || (req.headers['x-forwarded-for'] as string) || undefined,
      userAgent: req.headers['user-agent'],
    };
  }
}
