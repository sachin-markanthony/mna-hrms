import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PunchDirection } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SitePunchDto {
  @ApiProperty({ example: 'PROJ-SOBHA-01' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ example: 'Sobha Neopolis' })
  @IsString()
  @IsNotEmpty()
  projectName: string;

  @ApiPropertyOptional({ example: 'LEAD-402' })
  @IsString()
  @IsOptional()
  leadId?: string;

  @ApiProperty({ enum: PunchDirection, example: PunchDirection.IN })
  @IsEnum(PunchDirection)
  direction: PunchDirection;

  @ApiProperty({ example: 12.9352, description: 'Current mobile GPS latitude' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 77.6245, description: 'Current mobile GPS longitude' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 12.9355, description: 'Developer project site latitude' })
  @IsNumber()
  projectLat: number;

  @ApiProperty({ example: 77.6248, description: 'Developer project site longitude' })
  @IsNumber()
  projectLng: number;

  @ApiPropertyOptional({ example: 'Client walkthrough completed' })
  @IsString()
  @IsOptional()
  notes?: string;
}
