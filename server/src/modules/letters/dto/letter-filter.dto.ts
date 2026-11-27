import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LetterType, LetterStatus } from '@prisma/client';

export class LetterFilterDto {
  @ApiPropertyOptional({ enum: LetterType })
  @IsEnum(LetterType)
  @IsOptional()
  letterType?: LetterType;

  @ApiPropertyOptional({ enum: LetterStatus })
  @IsEnum(LetterStatus)
  @IsOptional()
  status?: LetterStatus;

  @ApiPropertyOptional({ description: 'Search by recipient name, email, or ref number' })
  @IsString()
  @IsOptional()
  search?: string;
}
