import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveType } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ApplyLeaveDto {
  @ApiPropertyOptional({ enum: LeaveType, default: LeaveType.LOP, example: LeaveType.LOP })
  @IsOptional()
  @IsEnum(LeaveType)
  leaveType?: LeaveType;

  @ApiProperty({ example: '2026-12-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-12-02' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'Family function out of town', minLength: 3 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  reason: string;
}
