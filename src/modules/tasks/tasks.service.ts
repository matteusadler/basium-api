import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { TaskFiltersDto } from './dto/task-filters.dto'

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, filters: TaskFiltersDto) {
    const where: any = { companyId }

    if (filters.userId) where.userId = filters.userId
    if (filters.leadId) where.leadId = filters.leadId
    if (filters.status) where.status = filters.status
    if (filters.type) where.type = filters.type
    if (filters.priority) where.priority = filters.priority

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags }
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {}
      if (filters.dueDateFrom) where.dueDate.gte = new Date(filters.dueDateFrom)
      if (filters.dueDateTo) where.dueDate.lte = new Date(filters.dueDateTo)
    }

    const orderBy: any = {}
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'asc'
    } else {
      orderBy.dueDate = 'asc'
    }

    return this.prisma.task.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            stage: { select: { name: true, color: true } },
          },
        },
      },
      orderBy,
    })
  }

  async findOne(id: string, companyId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, companyId },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            pipeline: { select: { name: true } },
            stage: { select: { name: true, color: true } },
          },
        },
      },
    })

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada')
    }

    return task
  }

  async create(companyId: string, userId: string, dto: CreateTaskDto) {
    // Verify lead belongs to company
    const lead = await this.prisma.lead.findFirst({
      where: { id: dto.leadId, companyId },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    return this.prisma.task.create({
      data: {
        companyId,
        leadId: dto.leadId,
        userId: dto.userId || userId,
        title: dto.title,
        description: dto.description,
        type: dto.type as any,
        priority: (dto.priority || 'MEDIUM') as any,
        dueDate: new Date(dto.dueDate),
        dueTime: dto.dueTime,
        tags: dto.tags || [],
      },
      include: {
        lead: {
          select: { id: true, name: true, phone: true },
        },
      },
    })
  }

  async update(id: string, companyId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: { id, companyId },
    })

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada')
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        type: dto.type as any,
        priority: dto.priority as any,
        status: dto.status as any,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      } as any,
    })
  }

  async complete(id: string, companyId: string, result?: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, companyId },
    })

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada')
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        status: 'DONE',
        result,
      },
    })
  }

  async cancel(id: string, companyId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, companyId },
    })

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada')
    }

    return this.prisma.task.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })
  }

  async delete(id: string, companyId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, companyId },
    })

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada')
    }

    return this.prisma.task.delete({ where: { id } })
  }

  // ================== SPECIAL QUERIES ==================

  async findToday(companyId: string, userId?: string) {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const where: any = {
      companyId,
      dueDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { in: ['PENDING', 'IN_PROGRESS'] },
    }

    if (userId) where.userId = userId

    return this.prisma.task.findMany({
      where,
      include: {
        lead: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: [{ priority: 'desc' }, { dueTime: 'asc' }],
    })
  }

  async findOverdue(companyId: string, userId?: string) {
    const now = new Date()

    const where: any = {
      companyId,
      dueDate: { lt: now },
      status: { in: ['PENDING', 'IN_PROGRESS'] },
    }

    if (userId) where.userId = userId

    // Also update status to OVERDUE
    await this.prisma.task.updateMany({
      where,
      data: { status: 'OVERDUE' },
    })

    return this.prisma.task.findMany({
      where: { ...where, status: 'OVERDUE' },
      include: {
        lead: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    })
  }

  async findUpcoming(companyId: string, userId?: string, days: number = 7) {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    const where: any = {
      companyId,
      dueDate: {
        gte: now,
        lte: futureDate,
      },
      status: { in: ['PENDING', 'IN_PROGRESS'] },
    }

    if (userId) where.userId = userId

    return this.prisma.task.findMany({
      where,
      include: {
        lead: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    })
  }

  async getCalendarView(companyId: string, userId: string | undefined, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const where: any = {
      companyId,
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
    }

    if (userId) where.userId = userId

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        lead: {
          select: { id: true, name: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    })

    // Group by day
    const calendar: Record<string, any[]> = {}
    tasks.forEach(task => {
      const day = task.dueDate.toISOString().split('T')[0]
      if (!calendar[day]) calendar[day] = []
      calendar[day].push(task)
    })

    return calendar
  }

  async getStats(companyId: string, userId?: string) {
    const where: any = { companyId }
    if (userId) where.userId = userId

    const now = new Date()
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const [total, pending, done, overdue, todayCount] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.task.count({ where: { ...where, status: 'DONE' } }),
      this.prisma.task.count({
        where: {
          ...where,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { lt: now },
        },
      }),
      this.prisma.task.count({
        where: {
          ...where,
          dueDate: { gte: startOfDay, lte: endOfDay },
        },
      }),
    ])

    const completionRate = total > 0 ? (done / total) * 100 : 0

    return {
      total,
      pending,
      done,
      overdue,
      todayCount,
      completionRate: Math.round(completionRate * 100) / 100,
    }
  }
}
