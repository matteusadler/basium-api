import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../common/prisma/prisma.service'

export type NotificationType = 'NEW_LEAD' | 'LEAD_STAGE_CHANGED' | 'TASK_DUE_TODAY' | 'CONTRACT_SIGNED'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(private prisma: PrismaService) {}

  async createNotification(
    userId: string,
    companyId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        companyId,
        type,
        title,
        body,
        data: data ? (data as any) : undefined,
      },
    })
    await this.sendPushNotification(userId, { title, body, data: notification.data })
    return notification
  }

  private async sendPushNotification(
    userId: string,
    payload: { title: string; body: string; data?: unknown },
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { pushSubscription: true },
      })
      const sub = user?.pushSubscription as Record<string, unknown> | null
      if (!sub || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return
      let webpush: { setVapidDetails: Function; sendNotification: Function }
      try {
        webpush = require('web-push')
      } catch {
        return
      }
      webpush.setVapidDetails(
        'mailto:support@basium.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY,
      )
      await webpush.sendNotification(
        sub,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          data: payload.data,
        }),
      )
    } catch (err) {
      this.logger.warn(`Push notification failed for user ${userId}: ${(err as Error).message}`)
    }
  }

  async findAll(userId: string, limit = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    })
    return { count }
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    })
    if (!notification) throw new NotFoundException('Notificação não encontrada')
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    })
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId },
      data: { read: true },
    })
    return { success: true }
  }

  async savePushSubscription(userId: string, subscription: Record<string, unknown>) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { pushSubscription: subscription as any },
    })
    return { success: true }
  }
}
