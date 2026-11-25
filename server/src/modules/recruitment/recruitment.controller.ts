import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service.js';

@ApiTags('Recruitment ATS')
@ApiBearerAuth('JWT-auth')
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}
}
