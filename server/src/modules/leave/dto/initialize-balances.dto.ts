import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class InitializeBalancesDto {
  @ApiProperty({ description: 'Target user UUID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  @Min(0)
  casual: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  @Min(0)
  sick: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0)
  earned: number;
}
