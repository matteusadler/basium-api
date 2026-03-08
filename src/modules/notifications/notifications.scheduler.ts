import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../../common/prisma/prisma.service'
import { NotificationsService } from './notifications.service'

@Injectable()
export class NotificationsScheduler {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  @Cron('0 8 * * *')
  async notifyTasksDueToday() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const tasks = await this.prisma.task.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: { id: true, title: true, userId: true, companyId: true },
    })

    for (const task of tasks) {
      if (task.userId) {
        this.notifications
          .createNotification(
            task.userId,
            task.companyId,
            'TASK_DUE_TODAY',
            'Tarefa vence hoje',
            task.title || 'Uma tarefa pendente vence hoje',
            { taskId: task.id },
          )
          .catch(() => {})
      }
    }
  }
}
