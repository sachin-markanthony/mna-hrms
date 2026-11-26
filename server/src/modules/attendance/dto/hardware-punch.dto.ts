import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PunchDirection } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class HardwarePunchDto {
  @ApiProperty({ example: 'EMP-005' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ enum: PunchDirection, example: PunchDirection.IN })
  @IsEnum(PunchDirection)
  direction: PunchDirection;

  @ApiPropertyOptional({ example: '192.168.1.50' })
  @IsString()
  @IsOptional()
  deviceIp?: string;

  @ApiPropertyOptional({ example: 96.5, description: 'Facial match confidence (0-100 or 0-1)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  faceConfidence?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  timestamp?: string;
}
