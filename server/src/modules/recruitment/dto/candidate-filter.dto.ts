import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RecruitmentDepartment, CandidateRecruitmentStatus } from '@prisma/client';

export class CandidateFilterDto {
  @ApiPropertyOptional({ enum: RecruitmentDepartment })
  @IsEnum(RecruitmentDepartment)
  @IsOptional()
  department?: RecruitmentDepartment;

  @ApiPropertyOptional({ enum: CandidateRecruitmentStatus })
  @IsEnum(CandidateRecruitmentStatus)
  @IsOptional()
  status?: CandidateRecruitmentStatus;

  @ApiPropertyOptional({ example: '2026-11-25', description: 'Filter candidates by visit date' })
  @IsString()
  @IsOptional()
  visitDate?: string;

  @ApiPropertyOptional({ example: 'Rohan' })
  @IsString()
  @IsOptional()
  search?: string;
}
