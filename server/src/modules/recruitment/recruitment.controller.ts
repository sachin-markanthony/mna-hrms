import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../core/decorators/public.decorator.js';
import { RecruitmentService } from './recruitment.service.js';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';
import { EvaluateRoundDto } from './dto/evaluate-round.dto.js';
import { UpdateCandidateStatusDto } from './dto/update-candidate-status.dto.js';
import { CandidateFilterDto } from './dto/candidate-filter.dto.js';

@ApiTags('Recruitment ATS & Walk-In Tracker')
@ApiBearerAuth('JWT-auth')
@Public()
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

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
  @ApiResponse({ status: 200, description: 'Recruitment statistics computed successfully.' })
  async getRecruitmentStats(@Query('visitDate') visitDate?: string) {
    return this.recruitmentService.getRecruitmentStats(visitDate);
  }

  @Get('candidates')
  @ApiOperation({
    summary: 'List walk-in candidates with filters for Department (DIGITAL/SALES), Status & Visit Date',
  })
  @ApiResponse({ status: 200, description: 'Candidates list retrieved.' })
  async getCandidates(@Query() filter: CandidateFilterDto) {
    return this.recruitmentService.getCandidates(filter);
  }

  @Get('candidates/:id')
  @ApiOperation({ summary: 'Get candidate details with HR and MR evaluation logs' })
  @ApiResponse({ status: 200, description: 'Candidate profile found.' })
  @ApiResponse({ status: 404, description: 'Candidate not found.' })
  async getCandidateById(@Param('id') id: string) {
    return this.recruitmentService.getCandidateById(id);
  }

  @Post('candidates')
  @ApiOperation({ summary: 'Register a new walk-in candidate visiting the office' })
  @ApiResponse({ status: 201, description: 'Candidate walk-in registered in REGISTERED status.' })
  async createCandidate(@Body() dto: CreateCandidateDto) {
    return this.recruitmentService.createCandidate(dto);
  }

  @Post('candidates/:id/evaluate-round')
  @ApiOperation({
    summary: 'Evaluate HR Round or MR Round (Pass to next round or Reject with reason)',
  })
  @ApiResponse({
    status: 200,
    description: 'Round evaluated: status transitioned to next round, selected, or rejected.',
  })
  async evaluateRound(@Param('id') id: string, @Body() dto: EvaluateRoundDto) {
    return this.recruitmentService.evaluateRound(id, dto);
  }

  @Patch('candidates/:id/status')
  @ApiOperation({ summary: 'Manual candidate status override' })
  @ApiResponse({ status: 200, description: 'Status updated.' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateCandidateStatusDto) {
    return this.recruitmentService.updateStatus(id, dto);
  }
}
