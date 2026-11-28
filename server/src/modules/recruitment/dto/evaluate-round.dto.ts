import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { InterviewRoundType, RoundEvaluationResult } from '@prisma/client';

export class EvaluateRoundDto {
  @ApiProperty({
    enum: InterviewRoundType,
    example: InterviewRoundType.HR_ROUND,
    description: 'Round evaluated: HR_ROUND or MR_ROUND',
  })
  @IsEnum(InterviewRoundType)
  @IsNotEmpty()
  round: InterviewRoundType;

  @ApiProperty({
    enum: RoundEvaluationResult,
    example: RoundEvaluationResult.PASSED,
    description: 'Result of the round: PASSED or REJECTED',
  })
  @IsEnum(RoundEvaluationResult)
  @IsNotEmpty()
  result: RoundEvaluationResult;

  @ApiProperty({ example: 'Sarah Jenkins (HR Lead)' })
  @IsString()
  @IsNotEmpty()
  interviewerName: string;

  @ApiPropertyOptional({ example: 'uuid-of-hr-coordinator' })
  @IsString()
  @IsOptional()
  hrCoordinatorId?: string;

  @ApiProperty({ example: 4.5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Strong communication skills and deep campaign metrics knowledge.' })
  @IsString()
  @IsNotEmpty()
  feedback: string;

  @ApiPropertyOptional({
    example: 'Salary expectation misaligned with band / Notice period too high',
    description: 'Required if result is REJECTED',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
