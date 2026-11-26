import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsEnum, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { RecruitmentDepartment } from '@prisma/client';

export class CreateCandidateDto {
  @ApiProperty({ example: 'Rohan Deshmukh' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'rohan.deshmukh@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+91 98234 56789' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    enum: RecruitmentDepartment,
    example: RecruitmentDepartment.DIGITAL,
    description: 'Only 2 departments allowed: DIGITAL or SALES',
  })
  @IsEnum(RecruitmentDepartment)
  @IsNotEmpty()
  department: RecruitmentDepartment;

  @ApiProperty({ example: 'Digital Marketing Specialist' })
  @IsString()
  @IsNotEmpty()
  appliedRole: string;

  @ApiPropertyOptional({
    example: '2026-11-25',
    description: 'Date candidate came to office (defaults to today)',
  })
  @IsDateString()
  @IsOptional()
  visitDate?: string;

  @ApiPropertyOptional({ example: 3.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  experienceYears?: number;

  @ApiPropertyOptional({ example: 'Zomato Ltd' })
  @IsString()
  @IsOptional()
  currentCompany?: string;

  @ApiPropertyOptional({ example: '₹14,00,000 / yr' })
  @IsString()
  @IsOptional()
  expectedSalary?: string;

  @ApiPropertyOptional({ example: ['SEO', 'Google Ads', 'Meta Campaigns'] })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 'Dhinesh Kumar', description: 'Assigned Team Leader name' })
  @IsString()
  @IsOptional()
  teamLeaderName?: string;

  @ApiPropertyOptional({ example: 'uuid-of-team-lead', description: 'Assigned Team Leader user ID' })
  @IsString()
  @IsOptional()
  teamLeaderId?: string;
}
