import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppRole, Roles } from '../../core/decorators/roles.decorator.js';
import { SendTestEmailDto } from './dto/send-test-email.dto.js';
import { MailService } from './mail.service.js';

@ApiTags('Mail')
@ApiBearerAuth('JWT-auth')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('status')
  @Roles(AppRole.SUPER_ADMIN, AppRole.HR_ADMIN)
  @ApiOperation({ summary: 'Verify SMTP configuration and live server connection' })
  getStatus() {
    return this.mailService.verifyConnection();
  }

  @Post('test')
  @Roles(AppRole.SUPER_ADMIN, AppRole.HR_ADMIN)
  @ApiOperation({ summary: 'Send a test email using configured SMTP credentials' })
  sendTest(@Body() dto: SendTestEmailDto) {
    return this.mailService.sendTestEmail(dto.to, dto.subject, dto.message);
  }
}
