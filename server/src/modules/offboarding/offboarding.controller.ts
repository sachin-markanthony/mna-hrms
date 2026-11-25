import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OffboardingService } from './offboarding.service.js';

@ApiTags('Offboarding & NOC Clearance')
@ApiBearerAuth('JWT-auth')
@Controller('offboarding')
export class OffboardingController {
  constructor(private readonly offboardingService: OffboardingService) {}
}
