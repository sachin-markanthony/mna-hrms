import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'superadmin@markanthony.in',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234', minLength: 4 })
  @IsString()
  @MinLength(4)
  password: string;
}
