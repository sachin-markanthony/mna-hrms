import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LeaveService } from './leave.service.js';

@ApiTags('Leave Management')
@ApiBearerAuth('JWT-auth')
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}
}
