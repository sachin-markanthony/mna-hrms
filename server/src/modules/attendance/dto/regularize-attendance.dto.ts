import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegularizeAttendanceDto {
  @ApiProperty({ example: '2026-11-24' })
  @IsDateString()
  attendanceDate: string;

  @ApiPropertyOptional({ example: '2026-11-24T09:30:00.000Z' })
  @IsDateString()
  @IsOptional()
  requestedIn?: string;

  @ApiPropertyOptional({ example: '2026-11-24T18:30:00.000Z' })
  @IsDateString()
  @IsOptional()
  requestedOut?: string;

  @ApiProperty({ example: 'Facial terminal was offline during morning rush' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  reason: string;
}
