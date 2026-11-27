import { IsString, IsOptional, IsEmail, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SendLetterEmailDto {
  @ApiPropertyOptional({ example: 'candidate@gmail.com' })
  @IsEmail()
  @IsOptional()
  recipientEmail?: string;

  @ApiPropertyOptional({ example: ['hr@markanthonyventures.com'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ccEmails?: string[];

  @ApiPropertyOptional({ example: 'Congratulations! We are thrilled to welcome you to the team.' })
  @IsString()
  @IsOptional()
  customMessage?: string;

  @ApiPropertyOptional({ example: 'Formal Offer of Employment - Mark Anthony Ventures' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ description: 'Base64 encoded PDF document of the offer letter' })
  @IsString()
  @IsOptional()
  pdfBase64?: string;

  @ApiPropertyOptional({ description: 'Optional custom attachment filename' })
  @IsString()
  @IsOptional()
  pdfFileName?: string;
}

