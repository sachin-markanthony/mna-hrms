import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service.js';
import { UpdateChapterProgressDto } from './dto/induction.dto.js';

@ApiTags('Onboarding & Induction LMS')
@ApiBearerAuth('JWT-auth')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('induction/employee')
  @ApiOperation({ summary: 'Get induction employee details' })
  async getEmployee(@Query('userId') userId?: string) {
    return this.onboardingService.getEmployeeInduction(userId);
  }

  @Get('induction/sessions')
  @ApiOperation({ summary: 'Get all 7 induction sessions with progress' })
  async getSessions(@Query('userId') userId?: string) {
    return this.onboardingService.getInductionSessions(userId);
  }

  @Get('induction/chapters')
  @ApiOperation({ summary: 'Get all 22 induction handbook chapters' })
  async getChapters(@Query('userId') userId?: string) {
    return this.onboardingService.getInductionChapters(userId);
  }

  @Get('induction/progress')
  @ApiOperation({ summary: 'Get overall induction progress metrics' })
  async getProgress(@Query('userId') userId?: string) {
    return this.onboardingService.getInductionProgress(userId);
  }

  @Get('induction/notifications')
  @ApiOperation({ summary: 'Get induction notifications' })
  async getNotifications(@Query('userId') userId?: string) {
    return this.onboardingService.getNotifications(userId);
  }

  @Patch('induction/notifications/:id/read')
  @ApiOperation({ summary: 'Mark induction notification as read' })
  async markNotificationRead(@Param('id') id: string) {
    return this.onboardingService.markNotificationRead(id);
  }

  @Patch('induction/chapters/:chapterId/progress')
  @ApiOperation({ summary: 'Update induction chapter completion or progress' })
  async updateChapterProgress(
    @Param('chapterId') chapterId: string,
    @Body() dto: UpdateChapterProgressDto,
    @Query('userId') userId?: string,
  ) {
    return this.onboardingService.updateChapterProgress(
      chapterId,
      dto.status,
      dto.progressPercentage,
      userId,
    );
  }
}
