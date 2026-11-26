import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendTestEmailDto {
  @ApiProperty({ example: 'sachin.markanthony@gmail.com', description: 'Recipient email address' })
  @IsEmail()
  to: string;

  @ApiPropertyOptional({ example: 'HRMS SMTP Test', description: 'Optional email subject' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  subject?: string;

  @ApiPropertyOptional({
    example: 'This is a test email from Mark Anthony HRMS.',
    description: 'Optional email body text',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
