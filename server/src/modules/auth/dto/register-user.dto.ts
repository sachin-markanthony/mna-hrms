import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { AppRole } from '../../../core/decorators/roles.decorator.js';

export class RegisterUserDto {
  @ApiProperty({ example: 'EMP-001' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ example: 'dhinesh@markanthony.in' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Dhinesh Kumar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'TempPass@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ enum: AppRole, default: AppRole.EMPLOYEE })
  @IsEnum(AppRole)
  @IsOptional()
  role?: AppRole;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  canImpersonate?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  teamId?: string;
}
