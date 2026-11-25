import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiProperty()
  isImpersonated: boolean;

  @ApiPropertyOptional()
  originalAdminId?: string;
}

export class AuthTokensResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiPropertyOptional()
  refreshToken?: string;

  @ApiProperty({ type: AuthUserViewDto })
  user: AuthUserViewDto;
}
