import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdatePayslipDto {
  @ApiPropertyOptional({ example: 2500, description: 'Additional bonus / incentive in INR' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bonus?: number;

  @ApiPropertyOptional({ example: 500, description: 'Other deductions (advance, TDS, etc.) in INR' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  otherDeductions?: number;

  @ApiPropertyOptional({ example: 1.5, description: 'Override LOP days while run is in DRAFT' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lopDays?: number;

  @ApiPropertyOptional({ example: 'Performance incentive added' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  remarks?: string;
}
