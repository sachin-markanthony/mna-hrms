import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ minLength: 4 })
  @IsString()
  @MinLength(4)
  currentPassword: string;

  @ApiProperty({ minLength: 4 })
  @IsString()
  @MinLength(4)
  newPassword: string;
}
