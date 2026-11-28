import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { MailModule } from '../../shared/mail/mail.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { RecruitmentController } from './recruitment.controller.js';
import { RecruitmentService } from './recruitment.service.js';

@Module({
  imports: [AuditModule, MailModule, NotificationsModule],
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
