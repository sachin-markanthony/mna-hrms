import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import { Public } from '../../core/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { RecruitmentService, type RequestMeta } from './recruitment.service.js';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';
import { EvaluateRoundDto } from './dto/evaluate-round.dto.js';
import { UpdateCandidateStatusDto } from './dto/update-candidate-status.dto.js';
import { CandidateFilterDto } from './dto/candidate-filter.dto.js';
import { VerifyCandidateDto } from './dto/verify-candidate.dto.js';
import { InterviewRoundType } from '@prisma/client';

@ApiTags('Recruitment ATS & Walk-In Tracker')
@ApiBearerAuth('JWT-auth')
@Public()
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get('team-leaders')
  @ApiOperation({ summary: 'Get list of active Team Leaders for walk-in candidate assignment' })
  @ApiResponse({ status: 200, description: 'Team leaders list retrieved.' })
  async getTeamLeaders() {
    return this.recruitmentService.getTeamLeaders();
  }

  @Get('hr-coordinators')
  @ApiOperation({ summary: 'Get list of active HR Coordinators for HR Round interviewer dropdown' })
  @ApiResponse({ status: 200, description: 'HR Coordinators list retrieved.' })
  async getHrCoordinators() {
    return this.recruitmentService.getHrCoordinators();
  }

  @Post('walk-in')
  @Public()
  @ApiOperation({ summary: 'Public QR walk-in candidate self-registration endpoint' })
  @ApiResponse({ status: 201, description: 'Walk-in candidate registered in REGISTERED status.' })
  async registerWalkIn(@Body() dto: CreateCandidateDto, @Req() req: Request) {
    return this.recruitmentService.createCandidate(
      dto,
      undefined,
      this.extractMeta(req),
      'QR_WALKIN',
    );
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get walk-in candidate metrics, selection rate & HR/MR rejection counts',
  })
  @ApiQuery({
    name: 'visitDate',
    required: false,
    example: '2026-11-25',
    description: 'Filter stats by specific walk-in date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'teamLeaderId',
    required: false,
    description: 'Filter stats by specific team leader ID',
  })
  @ApiQuery({
    name: 'teamLeaderName',
    required: false,
    description: 'Filter stats by specific team leader name',
  })
  @ApiResponse({ status: 200, description: 'Recruitment statistics computed successfully.' })
  async getRecruitmentStats(
    @Query('visitDate') visitDate?: string,
    @Query('teamLeaderId') teamLeaderId?: string,
    @Query('teamLeaderName') teamLeaderName?: string,
    @CurrentUser() actor?: AuthenticatedUser,
  ) {
    return this.recruitmentService.getRecruitmentStats(visitDate, actor, teamLeaderId, teamLeaderName);
  }

  @Get('candidates')
  @ApiOperation({
    summary: 'List walk-in candidates with filters for Department, Status, Visit Date & Team Leader',
  })
  @ApiResponse({ status: 200, description: 'Candidates list retrieved.' })
  async getCandidates(
    @Query() filter: CandidateFilterDto,
    @CurrentUser() actor?: AuthenticatedUser,
  ) {
    return this.recruitmentService.getCandidates(filter, actor);
  }

  @Get('candidates/:id')
  @ApiOperation({ summary: 'Get candidate details with HR and MR evaluation logs' })
  @ApiResponse({ status: 200, description: 'Candidate profile found.' })
  @ApiResponse({ status: 404, description: 'Candidate not found.' })
  async getCandidateById(
    @Param('id') id: string,
    @CurrentUser() actor?: AuthenticatedUser,
  ) {
    return this.recruitmentService.getCandidateById(id, actor);
  }

  @Patch('candidates/:id/verify')
  @ApiOperation({ summary: 'HR validates walk-in candidate, assigns Team Lead & confidential notes, and forwards to HR Round' })
  @ApiResponse({ status: 200, description: 'Candidate verified and optionally moved to HR_ROUND.' })
  async verifyCandidate(
    @Param('id') id: string,
    @Body() dto: VerifyCandidateDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    if (!actor || !['SUPER_ADMIN', 'HR_ADMIN', 'HR_COORDINATOR'].includes(actor.role)) {
      throw new ForbiddenException('Only HR or Management can verify walk-in candidates.');
    }
    return this.recruitmentService.verifyAndForwardCandidate(
      id,
      dto,
      actor,
      this.extractMeta(req),
    );
  }

  @Post('candidates')
  @ApiOperation({ summary: 'Register a new walk-in candidate visiting the office' })
  @ApiResponse({ status: 201, description: 'Candidate walk-in registered in REGISTERED status.' })
  async createCandidate(
    @Body() dto: CreateCandidateDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    if (actor?.role === 'TEAM_LEADER') {
      throw new ForbiddenException('Team Leaders are not authorized to register walk-in candidates.');
    }
    return this.recruitmentService.createCandidate(dto, actor?.id, this.extractMeta(req));
  }

  @Post('candidates/:id/evaluate-round')
  @ApiOperation({
    summary: 'Evaluate HR Round or MR Round (Pass to next round or Reject with reason)',
  })
  @ApiResponse({
    status: 200,
    description: 'Round evaluated: status transitioned to next round, selected, or rejected.',
  })
  async evaluateRound(
    @Param('id') id: string,
    @Body() dto: EvaluateRoundDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    if (actor?.role === 'EMPLOYEE') {
      throw new ForbiddenException('You do not have permission to evaluate interview rounds.');
    }
    if (dto.round === InterviewRoundType.HR_ROUND && actor?.role === 'TEAM_LEADER') {
      throw new ForbiddenException('Team Leaders can only evaluate the MR Round.');
    }
    if (
      dto.round === InterviewRoundType.MR_ROUND &&
      actor?.role !== 'SUPER_ADMIN' &&
      actor?.role !== 'TEAM_LEADER'
    ) {
      throw new ForbiddenException('Only Team Leaders or Management (MR) can evaluate the MR Round.');
    }
    return this.recruitmentService.evaluateRound(id, dto, actor?.id, this.extractMeta(req));
  }

  @Patch('candidates/:id/status')
  @ApiOperation({ summary: 'Manual candidate status override' })
  @ApiResponse({ status: 200, description: 'Status updated.' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCandidateStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.recruitmentService.updateStatus(id, dto, actor?.id, this.extractMeta(req));
  }

  private extractMeta(req: Request): RequestMeta {
    return {
      ipAddress: (req.ip as string) || (req.headers['x-forwarded-for'] as string) || undefined,
      userAgent: req.headers['user-agent'],
    };
  }
}
