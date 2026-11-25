import { Module } from '@nestjs/common';
import { OffboardingController } from './offboarding.controller.js';
import { OffboardingService } from './offboarding.service.js';

@Module({
  controllers: [OffboardingController],
  providers: [OffboardingService],
  exports: [OffboardingService],
})
export class OffboardingModule {}
