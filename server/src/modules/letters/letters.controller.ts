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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import { Public } from '../../core/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { LettersService, type RequestMeta } from './letters.service.js';
import { CreateLetterDto } from './dto/create-letter.dto.js';
import { LetterFilterDto } from './dto/letter-filter.dto.js';
import { SendLetterEmailDto } from './dto/send-email.dto.js';

@ApiTags('Official Letters & Document Releasing')
@ApiBearerAuth('JWT-auth')
@Public()
@Controller('letters')
export class LettersController {
  constructor(private readonly lettersService: LettersService) {}

  @Post()
  @ApiOperation({ summary: 'Create and issue a new official corporate letter' })
  @ApiResponse({ status: 201, description: 'Letter created with audit log.' })
  async createLetter(
    @Body() dto: CreateLetterDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    if (actor?.role === 'TEAM_LEADER' || actor?.role === 'EMPLOYEE') {
      throw new ForbiddenException('Only HR & Administrators can issue official company letters.');
    }
    return this.lettersService.createLetter(dto, actor?.id, this.extractMeta(req));
  }

  @Get()
  @ApiOperation({ summary: 'List all issued official letters' })
  @ApiResponse({ status: 200, description: 'List of letters retrieved.' })
  async getLetters(@Query() filter: LetterFilterDto) {
    return this.lettersService.getLetters(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of an official letter by ID' })
  @ApiResponse({ status: 200, description: 'Letter retrieved.' })
  async getLetterById(@Param('id') id: string) {
    return this.lettersService.getLetterById(id);
  }

  @Post(':id/send-email')
  @ApiOperation({ summary: 'Dispatch formal offer letter email directly to candidate via configured SMTP' })
  @ApiResponse({ status: 200, description: 'Email sent successfully via SMTP.' })
  async sendLetterEmail(
    @Param('id') id: string,
    @Body() dto: SendLetterEmailDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    if (actor?.role === 'TEAM_LEADER' || actor?.role === 'EMPLOYEE') {
      throw new ForbiddenException('Only HR & Administrators can email official company letters.');
    }
    return this.lettersService.sendLetterEmail(id, dto, actor?.id, this.extractMeta(req));
  }

  @Post(':id/action')
  @ApiOperation({ summary: 'Record letter action (DOWNLOADED, PRINTED, EMAILED) for audit trace' })
  @ApiResponse({ status: 200, description: 'Action recorded in audit log.' })
  async logAction(
    @Param('id') id: string,
    @Body('action') action: 'DOWNLOADED' | 'PRINTED' | 'EMAILED',
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.lettersService.logLetterAction(id, action || 'DOWNLOADED', actor?.id, this.extractMeta(req));
  }

  @Patch(':id/response')
  @ApiOperation({ summary: 'Record candidate Accept or Reject response after email has been sent' })
  @ApiResponse({ status: 200, description: 'Candidate response recorded with audit log.' })
  async recordResponse(
    @Param('id') id: string,
    @Body() body: { response: 'ACCEPTED' | 'REJECTED'; remarks?: string },
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    if (actor?.role === 'TEAM_LEADER' || actor?.role === 'EMPLOYEE') {
      throw new ForbiddenException('Only HR & Administrators can record candidate responses.');
    }
    return this.lettersService.recordCandidateResponse(
      id,
      body.response,
      body.remarks,
      actor?.id,
      this.extractMeta(req),
    );
  }

  @Patch(':id/revoke')
  @ApiOperation({ summary: 'Revoke an issued letter' })
  @ApiResponse({ status: 200, description: 'Letter revoked.' })
  async revokeLetter(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    if (actor?.role === 'TEAM_LEADER' || actor?.role === 'EMPLOYEE') {
      throw new ForbiddenException('Only HR & Administrators can revoke official letters.');
    }
    return this.lettersService.revokeLetter(id, actor?.id, this.extractMeta(req));
  }

  private extractMeta(req: Request): RequestMeta {
    return {
      ipAddress: (req.ip as string) || (req.headers['x-forwarded-for'] as string) || undefined,
      userAgent: req.headers['user-agent'],
    };
  }
}
