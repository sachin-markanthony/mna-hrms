import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssetType } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAssetDto {
  @ApiPropertyOptional({ enum: AssetType, default: AssetType.LAPTOP })
  @IsOptional()
  @IsEnum(AssetType)
  assetType?: AssetType;

  @ApiProperty({ example: '2026-11-28' })
  @IsDateString()
  reportDate: string;

  @ApiPropertyOptional({ description: 'Linked User ID if selected from directory' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'Priya Menon' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  employeeName: string;

  @ApiProperty({ example: 'EMP-005' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  employeeCode: string;

  @ApiProperty({ example: 'Sales & Leasing' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  department: string;

  @ApiProperty({ example: 'Senior Sales Executive' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  designation: string;

  @ApiProperty({ example: '+91 98765 43210' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  contactNumber: string;

  @ApiProperty({ example: 'Dell' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  laptopBrand: string;

  @ApiProperty({ example: 'Latitude 5430' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  model: string;

  @ApiProperty({ example: 'DL5430-998811' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  serialNumber: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  chargerReceived: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  mouseReceived?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  keyboardReceived?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  simCardReceived?: boolean;

  @ApiPropertyOptional({ example: '8991450012345678901' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  simCardNumber?: string;

  @ApiProperty({ example: '2026-11-28T10:30:00' })
  @IsDateString()
  collectedAt: string;

  @ApiPropertyOptional({ example: 'Priya Menon' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  employeeSignature?: string;

  @ApiPropertyOptional({ example: '2026-11-28' })
  @IsOptional()
  @IsDateString()
  employeeSignedDate?: string;

  @ApiPropertyOptional({ example: 'Ananya Sharma' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorizedRepresentative?: string;

  @ApiPropertyOptional({ example: '2026-11-28' })
  @IsOptional()
  @IsDateString()
  authorizedSignedDate?: string;
}
