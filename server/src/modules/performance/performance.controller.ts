import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PerformanceService } from './performance.service.js';

@ApiTags('Performance & OKRs')
@ApiBearerAuth('JWT-auth')
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}
}
