import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { AssetStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateAssetDto } from './create-asset.dto.js';

export class UpdateAssetDto extends PartialType(CreateAssetDto) {
  @ApiPropertyOptional({ enum: AssetStatus })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiPropertyOptional({ example: '2026-12-15' })
  @IsOptional()
  @IsDateString()
  returnedAt?: string;

  @ApiPropertyOptional({ example: 'Returned in good condition with charger' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  returnNotes?: string;
}
