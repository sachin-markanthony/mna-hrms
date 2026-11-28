import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { MailModule } from '../../shared/mail/mail.module.js';
import { OffboardingController } from './offboarding.controller.js';
import { OffboardingService } from './offboarding.service.js';

@Module({
  imports: [AuditModule, MailModule],
  controllers: [OffboardingController],
  providers: [OffboardingService],
  exports: [OffboardingService],
})
export class OffboardingModule {}
