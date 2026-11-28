import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryEmployeesDto {
  @ApiPropertyOptional({ description: 'Search by name, email, or employeeId' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiPropertyOptional({
    description: 'Filter by employment status: ACTIVE (default, includes ON_NOTICE), ON_NOTICE, INACTIVE, or ALL',
  })
  @IsString()
  @IsOptional()
  employmentStatus?: string;
}
