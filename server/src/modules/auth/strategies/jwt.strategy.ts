import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { EmploymentStatus } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getRequiredEnv } from '../../../core/config/app.config.js';
import { AppRole } from '../../../core/decorators/roles.decorator.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import type { AuthenticatedUser, JwtPayload } from '../types/jwt-payload.type.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getRequiredEnv('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        employeeId: true,
        name: true,
        role: true,
        roleId: true,
        isArchived: true,
        employmentStatus: true,
        roleDefinition: {
          select: {
            permissions: {
              select: {
                permission: {
                  select: { key: true },
                },
              },
            },
          },
        },
      },
    });

    if (
      !user ||
      user.isArchived ||
      user.employmentStatus === EmploymentStatus.ARCHIVED ||
      user.employmentStatus === EmploymentStatus.INACTIVE
    ) {
      throw new UnauthorizedException('User account is inactive or archived');
    }

    let permissions =
      user.roleDefinition?.permissions.map((rp) => rp.permission.key) ?? [];

    if (!user.roleId && permissions.length === 0) {
      const fallbackRole = await this.prisma.roleDefinition.findUnique({
        where: { name: user.role },
        select: {
          permissions: {
            select: { permission: { select: { key: true } } },
          },
        },
      });
      permissions = fallbackRole?.permissions.map((rp) => rp.permission.key) ?? [];
    }

    const completedOffboarding = await this.prisma.offboardingRequest.findFirst({
      where: { userId: user.id, status: 'COMPLETED', completedAt: { not: null } },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    });

    const isOffboardedGraceAccess = Boolean(
      completedOffboarding?.completedAt &&
        Date.now() <= completedOffboarding.completedAt.getTime() + 7 * 24 * 60 * 60 * 1000,
    );

    return {
      id: user.id,
      email: user.email,
      employeeId: user.employeeId,
      name: user.name,
      role: user.role as unknown as AppRole,
      roleId: user.roleId ?? undefined,
      permissions,
      isOffboardedGraceAccess,
    };
  }
}
