import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { RecruitmentController } from './recruitment.controller.js';
import { RecruitmentService } from './recruitment.service.js';

@Module({
  imports: [AuditModule],
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
