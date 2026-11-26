import { ApiProperty } from '@nestjs/swagger';
import { AppRole } from '../../../core/decorators/roles.decorator.js';

export class AuthUserViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: AppRole })
  role: AppRole;

  @ApiProperty({ type: [String], description: 'Dynamic permissions assigned to the user role' })
  permissions: string[];
}

export class AuthTokensResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: AuthUserViewDto })
  user: AuthUserViewDto;
}
