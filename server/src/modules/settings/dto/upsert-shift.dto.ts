import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UpsertShiftDto {
  @ApiProperty({ example: 'General Office Shift' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '09:30' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be HH:MM (24h)' })
  startTime: string;

  @ApiProperty({ example: '18:30' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be HH:MM (24h)' })
  endTime: string;

  @ApiProperty({ example: 15, minimum: 0, maximum: 120 })
  @IsInt()
  @Min(0)
  @Max(120)
  gracePeriodMinutes: number;

  @ApiProperty({ example: 8.5, minimum: 1, maximum: 24 })
  @IsNumber()
  @Min(1)
  @Max(24)
  fullDayHours: number;

  @ApiProperty({ example: 4.0, minimum: 1, maximum: 12 })
  @IsNumber()
  @Min(1)
  @Max(12)
  halfDayHours: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
