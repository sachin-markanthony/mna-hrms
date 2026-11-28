import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOffboardingDto {
  @ApiPropertyOptional({ description: 'Target Employee ID (HR/Admin can specify; employees default to self)' })
  @IsString()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({ example: '2026-11-28' })
  @IsDateString()
  @IsOptional()
  resignationDate?: string;

  @ApiProperty({ example: 'Pursuing higher studies / career growth opportunity' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ example: 'All active client accounts documented for handover.' })
  @IsString()
  @IsOptional()
  handoverNotes?: string;
}

export class TerminateEmployeeDto {
  @ApiProperty({ description: 'Target Employee ID or User ID to terminate immediately' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiPropertyOptional({ example: '2026-11-28' })
  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @ApiProperty({ example: 'Performance / disciplinary policy violation' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ApproveOffboardingDto {
  @ApiPropertyOptional({ description: 'Optional override Last Working Day for early release / buyout' })
  @IsDateString()
  @IsOptional()
  lastWorkingDay?: string;

  @ApiPropertyOptional({ example: 'Early release approved by Management.' })
  @IsString()
  @IsOptional()
  earlyReleaseRemarks?: string;
}

export enum NocCheckpointType {
  ASSETS = 'ASSETS',
  EXPERIENCE_LETTER = 'EXPERIENCE_LETTER',
}

export enum NocClearanceStatus {
  PENDING = 'PENDING',
  CLEARED = 'CLEARED',
}

export class UpdateNocDto {
  @ApiProperty({ enum: NocCheckpointType })
  @IsEnum(NocCheckpointType)
  checkpoint: NocCheckpointType;

  @ApiProperty({ enum: NocClearanceStatus })
  @IsEnum(NocClearanceStatus)
  status: NocClearanceStatus;

  @ApiPropertyOptional({ example: 'Laptop, ID card, and CRM devices returned.' })
  @IsString()
  @IsOptional()
  remarks?: string;
}
