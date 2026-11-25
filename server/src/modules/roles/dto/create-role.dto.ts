import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'FINANCE_MANAGER',
    description: 'Uppercase snake_case role identifier',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message: 'Role name must be uppercase snake_case (e.g. FINANCE_MANAGER)',
  })
  name: string;

  @ApiProperty({ example: 'Finance Manager' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiPropertyOptional({ example: 'Manages payroll, reimbursements, and finance NOC' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String], description: 'Initial permission UUIDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[];
}
