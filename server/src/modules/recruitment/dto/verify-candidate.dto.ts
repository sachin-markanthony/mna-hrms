import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { RecruitmentDepartment } from '@prisma/client';

export class VerifyCandidateDto {
  @ApiPropertyOptional({ enum: RecruitmentDepartment })
  @IsEnum(RecruitmentDepartment)
  @IsOptional()
  department?: RecruitmentDepartment;

  @ApiPropertyOptional({ example: 'Sales Executive' })
  @IsString()
  @IsOptional()
  appliedRole?: string;

  @ApiPropertyOptional({ example: '₹6,00,000 / yr' })
  @IsString()
  @IsOptional()
  expectedSalary?: string;

  @ApiPropertyOptional({ example: 'uuid-of-team-lead' })
  @IsString()
  @IsOptional()
  teamLeaderId?: string;

  @ApiPropertyOptional({ example: 'Dhinesh Kumar' })
  @IsString()
  @IsOptional()
  teamLeaderName?: string;

  @ApiPropertyOptional({ example: 'Approved salary band up to 6 LPA. Strong referral.' })
  @IsString()
  @IsOptional()
  confidentialNotes?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'If true, moves candidate from REGISTERED (Walk-In) to HR_ROUND',
  })
  @IsBoolean()
  @IsOptional()
  proceedToHr?: boolean;
}
