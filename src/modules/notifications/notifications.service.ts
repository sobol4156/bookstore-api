import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { DbService } from '../db/db.service';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly dbService: DbService) { }

  async getNotifications(userId: string, query: GetNotificationsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: Prisma.NotificationWhereInput = { userId };
    if (typeof query.read === 'boolean') {
      where.read = query.read;
    }

    const [notifications, total] = await Promise.all([
      this.dbService.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.dbService.notification.count({ where }),
    ]);

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getNotificationById(userId: string, notificationId: string) {
    const notification = await this.dbService.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }

    return notification;
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.dbService.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }

    if (notification.read) {
      return notification;
    }

    return this.dbService.notification.update({
      where: { id: notificationId },
      data: { read: true, sentAt: notification.sentAt ?? new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.dbService.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return {
      updated: result.count,
    };
  }
}

