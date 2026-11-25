import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface CreateAuditLogInput {
  actorUserId: string;
  targetUserId?: string;
  actionType: string;
  ipAddress?: string;
  userAgent?: string;
  oldValuePayload?: Prisma.InputJsonValue;
  newValuePayload?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tier 2 strictly append-only security & impersonation audit log.
   */
  async log(input: CreateAuditLogInput) {
    return this.prisma.systemAuditLog.create({
      data: {
        actorUserId: input.actorUserId,
        targetUserId: input.targetUserId,
        actionType: input.actionType,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        oldValuePayload: input.oldValuePayload,
        newValuePayload: input.newValuePayload,
      },
    });
  }
}
