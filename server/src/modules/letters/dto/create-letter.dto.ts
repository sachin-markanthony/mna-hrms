import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LetterType } from '@prisma/client';

export class CreateLetterDto {
  @ApiPropertyOptional({ enum: LetterType, default: LetterType.OFFER_LETTER })
  @IsEnum(LetterType)
  @IsOptional()
  letterType?: LetterType;

  @ApiProperty({ example: 'Abhishek Sharma' })
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @ApiProperty({ example: 'abhishek@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @ApiPropertyOptional({ example: '+91 9825375182' })
  @IsString()
  @IsOptional()
  recipientPhone?: string;

  @ApiProperty({ example: 'Senior Sales Executive' })
  @IsString()
  @IsNotEmpty()
  designation: string;

  @ApiProperty({ example: 'SALES' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiPropertyOptional({ example: 600000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  annualGrossCtc?: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyGross?: number;

  @ApiPropertyOptional({ example: '2026-12-01' })
  @IsString()
  @IsOptional()
  joiningDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsString()
  @IsOptional()
  relievingDate?: string;

  @ApiPropertyOptional({ example: 'MNA001' })
  @IsString()
  @IsOptional()
  employeeCode?: string;

  @ApiPropertyOptional({ example: 'MR' })
  @IsString()
  @IsOptional()
  recipientGender?: string;

  @ApiPropertyOptional({ example: 'Bangalore, Karnataka' })
  @IsString()
  @IsOptional()
  workLocation?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  probationMonths?: number;

  @ApiPropertyOptional({ example: '2026-12-05' })
  @IsString()
  @IsOptional()
  validUntil?: string;

  @ApiPropertyOptional({ example: 'Mark Anthony Fegradoe' })
  @IsString()
  @IsOptional()
  ceoName?: string;

  @ApiPropertyOptional({ example: 'Founder & Chief Executive Officer' })
  @IsString()
  @IsOptional()
  ceoTitle?: string;

  @ApiPropertyOptional({ example: 'Shilpa Kumari P' })
  @IsString()
  @IsOptional()
  headOfHrName?: string;

  @ApiPropertyOptional({ example: 'Head of Finance and Human Resources' })
  @IsString()
  @IsOptional()
  headOfHrTitle?: string;

  @ApiPropertyOptional({ example: 'Special joining performance incentive applicable.' })
  @IsString()
  @IsOptional()
  customNotes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  candidateId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  employeeId?: string;
}
