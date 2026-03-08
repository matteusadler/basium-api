import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(companyId: string) {
    const [leads, tasks, conversations] = await Promise.all([
      this.prisma.lead.count({ where: { companyId } }),
      this.prisma.task.count({ where: { companyId } }),
      this.prisma.conversation.count({ where: { companyId } }),
    ])

    return { leads, tasks, conversations }
  }
}
