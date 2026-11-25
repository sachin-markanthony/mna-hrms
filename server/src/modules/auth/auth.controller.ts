import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import { Public } from '../../core/decorators/public.decorator.js';
import { AppRole, Roles } from '../../core/decorators/roles.decorator.js';
import { AuthService, type RequestMeta } from './auth.service.js';
import { AuthTokensResponseDto, AuthUserViewDto } from './dto/auth-response.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ImpersonateDto } from './dto/impersonate.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterUserDto } from './dto/register-user.dto.js';
import type { AuthenticatedUser } from './types/jwt-payload.type.js';

@ApiTags('Auth & Impersonation')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  @ApiResponse({ status: 200, type: AuthTokensResponseDto })
  login(@Body() dto: LoginDto, @Req() req: Request): Promise<AuthTokensResponseDto> {
    return this.authService.login(dto, this.extractMeta(req));
  }

  @ApiBearerAuth('JWT-auth')
  @Roles(AppRole.SUPER_ADMIN, AppRole.HR_ADMIN)
  @Post('register')
  @ApiOperation({ summary: 'Provision a new employee user (SuperAdmin / HR Admin only)' })
  @ApiResponse({ status: 201, type: AuthUserViewDto })
  register(
    @Body() dto: RegisterUserDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<AuthUserViewDto> {
    return this.authService.register(dto, actor.id, this.extractMeta(req));
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate access and refresh tokens' })
  @ApiResponse({ status: 200, type: AuthTokensResponseDto })
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensResponseDto> {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @ApiBearerAuth('JWT-auth')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke refresh token and log out' })
  logout(@CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.authService.logout(user.id, this.extractMeta(req));
  }

  @ApiBearerAuth('JWT-auth')
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile & impersonation status' })
  @ApiResponse({ status: 200, type: AuthUserViewDto })
  getProfile(@CurrentUser() user: AuthenticatedUser): AuthUserViewDto {
    return this.authService.getProfile(user);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles(AppRole.SUPER_ADMIN)
  @Post('impersonate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Universal Login ("Login As") — SuperAdmin impersonates a target user' })
  @ApiResponse({ status: 200, type: AuthTokensResponseDto })
  impersonate(
    @Body() dto: ImpersonateDto,
    @CurrentUser() adminUser: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<AuthTokensResponseDto> {
    return this.authService.impersonate(adminUser, dto.targetUserId, this.extractMeta(req));
  }

  @ApiBearerAuth('JWT-auth')
  @Post('exit-impersonate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exit active impersonation session and restore SuperAdmin token' })
  @ApiResponse({ status: 200, type: AuthTokensResponseDto })
  exitImpersonate(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<AuthTokensResponseDto> {
    return this.authService.exitImpersonation(currentUser, this.extractMeta(req));
  }

  @ApiBearerAuth('JWT-auth')
  @Patch('change-password')
  @ApiOperation({ summary: 'Change current user password' })
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    return this.authService.changePassword(user.id, dto, this.extractMeta(req));
  }

  private extractMeta(req: Request): RequestMeta {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
