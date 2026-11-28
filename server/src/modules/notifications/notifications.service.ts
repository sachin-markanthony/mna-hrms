import { Injectable, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface NotificationPayload {
  title: string;
  message: string;
  type?: string;
  link?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMyNotifications(userId: string) {
    const [items, unreadCount] = await Promise.all([
      this.prisma.portalNotification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 25,
      }),
      this.prisma.portalNotification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return { items, unreadCount };
  }

  async markRead(userId: string, id: string) {
    await this.prisma.portalNotification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.portalNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  async notifyUser(userId: string, payload: NotificationPayload) {
    try {
      return await this.prisma.portalNotification.create({
        data: {
          userId,
          title: payload.title,
          message: payload.message,
          type: payload.type || 'GENERAL',
          link: payload.link,
        },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to create notification for user ${userId}: ${err?.message}`);
      return null;
    }
  }

  async notifyRoles(roles: Role[], payload: NotificationPayload) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          role: { in: roles },
          isArchived: false,
          employmentStatus: { in: ['ACTIVE', 'ON_NOTICE'] },
        },
        select: { id: true, email: true, name: true, role: true },
      });

      if (users.length === 0) return [];

      await this.prisma.portalNotification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          title: payload.title,
          message: payload.message,
          type: payload.type || 'GENERAL',
          link: payload.link,
        })),
      });

      return users;
    } catch (err: any) {
      this.logger.warn(`Failed to notify roles ${roles.join(',')}: ${err?.message}`);
      return [];
    }
  }
}
