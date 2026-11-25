import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { EmploymentStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getRequiredEnv } from '../../core/config/app.config.js';
import { AppRole } from '../../core/decorators/roles.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { AuthTokensResponseDto, AuthUserViewDto } from './dto/auth-response.dto.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterUserDto } from './dto/register-user.dto.js';
import type { AuthenticatedUser, JwtPayload } from './types/jwt-payload.type.js';

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async login(dto: LoginDto, meta: RequestMeta): Promise<AuthTokensResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email.toLowerCase(),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (
      user.isArchived ||
      user.employmentStatus === EmploymentStatus.ARCHIVED ||
      user.employmentStatus === EmploymentStatus.INACTIVE
    ) {
      throw new ForbiddenException('Account is inactive or archived');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens({
      id: user.id,
      email: user.email,
      employeeId: user.employeeId,
      name: user.name,
      role: user.role as unknown as AppRole,
      isImpersonated: false,
    });

    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, this.BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash,
        lastLoginAt: new Date(),
      },
    });

    await this.auditService.log({
      actorUserId: user.id,
      targetUserId: user.id,
      actionType: 'LOGIN',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.toUserView({
        id: user.id,
        email: user.email,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role as unknown as AppRole,
        isImpersonated: false,
      }),
    };
  }

  async register(
    dto: RegisterUserDto,
    actorUserId: string,
    meta: RequestMeta,
  ): Promise<AuthUserViewDto> {
    const normalizedEmail = dto.email.toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { employeeId: dto.employeeId }],
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('User with this email or employee ID already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);
    const created = await this.prisma.user.create({
      data: {
        employeeId: dto.employeeId,
        email: normalizedEmail,
        name: dto.name,
        passwordHash,
        phone: dto.phone,
        role: (dto.role ?? AppRole.EMPLOYEE) as unknown as Role,
        canImpersonate: dto.canImpersonate ?? false,
        teamId: dto.teamId,
      },
    });

    await this.auditService.log({
      actorUserId,
      targetUserId: created.id,
      actionType: 'USER_PROVISIONED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        employeeId: created.employeeId,
        email: created.email,
        role: created.role,
      },
    });

    return this.toUserView({
      id: created.id,
      email: created.email,
      employeeId: created.employeeId,
      name: created.name,
      role: created.role as unknown as AppRole,
      isImpersonated: false,
    });
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokensResponseDto> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: getRequiredEnv('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.refreshTokenHash || user.isArchived) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    const tokens = await this.issueTokens({
      id: user.id,
      email: user.email,
      employeeId: user.employeeId,
      name: user.name,
      role: user.role as unknown as AppRole,
      isImpersonated: false,
    });

    const newRefreshHash = await bcrypt.hash(tokens.refreshToken, this.BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: newRefreshHash },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.toUserView({
        id: user.id,
        email: user.email,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role as unknown as AppRole,
        isImpersonated: false,
      }),
    };
  }

  async logout(userId: string, meta: RequestMeta): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });

    await this.auditService.log({
      actorUserId: userId,
      targetUserId: userId,
      actionType: 'LOGOUT',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { message: 'Logged out successfully' };
  }

  getProfile(user: AuthenticatedUser): AuthUserViewDto {
    return this.toUserView(user);
  }

  /**
   * Pillar 1: Universal Login ("Login As")
   * Issues an ephemeral JWT scoped to the target user while preserving originalAdminId.
   */
  async impersonate(
    adminUser: AuthenticatedUser,
    targetUserId: string,
    meta: RequestMeta,
  ): Promise<AuthTokensResponseDto> {
    if (adminUser.role !== AppRole.SUPER_ADMIN && !adminUser.canImpersonate) {
      throw new ForbiddenException('You do not have impersonation privileges');
    }

    if (adminUser.isImpersonated) {
      throw new BadRequestException('Exit current impersonation session before starting another');
    }

    if (adminUser.id === targetUserId) {
      throw new BadRequestException('Cannot impersonate yourself');
    }

    const target = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target || target.isArchived || target.employmentStatus === EmploymentStatus.ARCHIVED) {
      throw new NotFoundException('Target user not found or archived');
    }

    const payload: JwtPayload = {
      sub: target.id,
      email: target.email,
      employeeId: target.employeeId,
      role: target.role as unknown as AppRole,
      isImpersonated: true,
      originalAdminId: adminUser.id,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: getRequiredEnv('JWT_SECRET'),
      expiresIn: getRequiredEnv('JWT_IMPERSONATE_EXPIRES_IN') as JwtSignOptions['expiresIn'],
    });

    await this.auditService.log({
      actorUserId: adminUser.id,
      targetUserId: target.id,
      actionType: 'IMPERSONATE_START',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        targetEmployeeId: target.employeeId,
        targetRole: target.role,
      },
    });

    return {
      accessToken,
      user: this.toUserView({
        id: target.id,
        email: target.email,
        employeeId: target.employeeId,
        name: target.name,
        role: target.role as unknown as AppRole,
        isImpersonated: true,
        originalAdminId: adminUser.id,
      }),
    };
  }

  async exitImpersonation(
    currentUser: AuthenticatedUser,
    meta: RequestMeta,
  ): Promise<AuthTokensResponseDto> {
    if (!currentUser.isImpersonated || !currentUser.originalAdminId) {
      throw new BadRequestException('Not currently in an impersonation session');
    }

    const originalAdmin = await this.prisma.user.findUnique({
      where: { id: currentUser.originalAdminId },
    });

    if (!originalAdmin || originalAdmin.isArchived) {
      throw new UnauthorizedException('Original admin account is no longer active');
    }

    const tokens = await this.issueTokens({
      id: originalAdmin.id,
      email: originalAdmin.email,
      employeeId: originalAdmin.employeeId,
      name: originalAdmin.name,
      role: originalAdmin.role as unknown as AppRole,
      isImpersonated: false,
    });

    await this.auditService.log({
      actorUserId: originalAdmin.id,
      targetUserId: currentUser.id,
      actionType: 'IMPERSONATE_EXIT',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.toUserView({
        id: originalAdmin.id,
        email: originalAdmin.email,
        employeeId: originalAdmin.employeeId,
        name: originalAdmin.name,
        role: originalAdmin.role as unknown as AppRole,
        isImpersonated: false,
      }),
    };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    meta: RequestMeta,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(dto.newPassword, this.BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHash,
        refreshTokenHash: null,
      },
    });

    await this.auditService.log({
      actorUserId: userId,
      targetUserId: userId,
      actionType: 'PASSWORD_CHANGE',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { message: 'Password updated successfully' };
  }

  private async issueTokens(user: {
    id: string;
    email: string;
    employeeId: string;
    name: string;
    role: AppRole;
    isImpersonated: boolean;
    originalAdminId?: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
      isImpersonated: user.isImpersonated,
      originalAdminId: user.originalAdminId,
    };

    const accessExpiresIn = getRequiredEnv('JWT_EXPIRES_IN') as JwtSignOptions['expiresIn'];
    const refreshExpiresIn = getRequiredEnv(
      'JWT_REFRESH_EXPIRES_IN',
    ) as JwtSignOptions['expiresIn'];

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: getRequiredEnv('JWT_SECRET'),
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: getRequiredEnv('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private toUserView(user: {
    id: string;
    employeeId: string;
    email: string;
    name: string;
    role: AppRole;
    isImpersonated: boolean;
    originalAdminId?: string;
  }): AuthUserViewDto {
    return {
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      name: user.name,
      role: user.role,
      isImpersonated: user.isImpersonated,
      originalAdminId: user.originalAdminId,
    };
  }
}
