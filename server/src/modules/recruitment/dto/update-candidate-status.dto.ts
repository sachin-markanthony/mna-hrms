import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CandidateRecruitmentStatus } from '@prisma/client';

export class UpdateCandidateStatusDto {
  @ApiProperty({
    enum: CandidateRecruitmentStatus,
    example: CandidateRecruitmentStatus.SELECTED,
  })
  @IsEnum(CandidateRecruitmentStatus)
  @IsNotEmpty()
  status: CandidateRecruitmentStatus;

  @ApiPropertyOptional({
    example: 'Cultural misalignment / Below technical benchmark',
    description: 'Reason if status is REJECTED_HR or REJECTED_MR',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
