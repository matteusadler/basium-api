import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { FlowExecutorService } from '../flows/flow-executor.service'
import { NotificationsService } from '../notifications/notifications.service'
import { CreateLeadDto } from './dto/create-lead.dto'
import { UpdateLeadDto } from './dto/update-lead.dto'
import { LeadFiltersDto } from './dto/lead-filters.dto'
import { MoveStageDto } from './dto/move-stage.dto'
import { MarkLostDto } from './dto/mark-lost.dto'
import { MarkWonDto } from './dto/mark-won.dto'
import { CreateNoteDto } from './dto/create-note.dto'

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private flowExecutor: FlowExecutorService,
    private notifications: NotificationsService,
  ) {}

  // ================== CRUD ==================

  async findAll(companyId: string, filters: LeadFiltersDto) {
    const where: any = { companyId }

    if (filters.pipelineId) where.pipelineId = filters.pipelineId
    if (filters.stageId) where.stageId = filters.stageId
    if (filters.userId) where.userId = filters.userId
    if (filters.status) where.status = filters.status
    if (filters.temperature) where.temperature = filters.temperature
    if (filters.origin) where.origin = filters.origin
    if (filters.isFavorite !== undefined) where.isFavorite = filters.isFavorite

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags }
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.minValue || filters.maxValue) {
      where.estimatedValue = {}
      if (filters.minValue) where.estimatedValue.gte = filters.minValue
      if (filters.maxValue) where.estimatedValue.lte = filters.maxValue
    }

    if (filters.createdFrom || filters.createdTo) {
      where.createdAt = {}
      if (filters.createdFrom) where.createdAt.gte = new Date(filters.createdFrom)
      if (filters.createdTo) where.createdAt.lte = new Date(filters.createdTo)
    }

    const orderBy: any = {}
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc'
    } else {
      orderBy.createdAt = 'desc'
    }

    const page = filters.page || 1
    const limit = filters.limit || 50
    const skip = (page - 1) * limit

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: {
          stage: { select: { id: true, name: true, color: true } },
          pipeline: { select: { id: true, name: true } },
          _count: {
            select: { tasks: true, notes: true, attachments: true, conversations: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ])

    const userIds = [...new Set(leads.map(l => l.userId).filter(Boolean))]
    const users = userIds.length > 0 ? await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true }
    }) : []
    const userMap = Object.fromEntries(users.map(u => [u.id, u]))
    const enrichedLeads = leads.map(l => ({ ...l, user: userMap[l.userId] || null }))

    return {
      data: enrichedLeads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findByStage(companyId: string, pipelineId: string, userId?: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId, companyId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            leads: {
              where: { status: 'ACTIVE', ...(userId ? { userId } : {}) },
              orderBy: { createdAt: 'desc' },
              include: {
                _count: {
                  select: { tasks: true },
                },
              },
            },
          },
        },
      },
    })

    if (!pipeline) {
      throw new NotFoundException('Pipeline não encontrado')
    }

    return pipeline.stages.map(stage => ({
      id: stage.id,
      name: stage.name,
      color: stage.color,
      order: stage.order,
      probability: stage.probability,
      type: stage.type,
      leads: stage.leads,
    }))
  }

  async findOne(id: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: {
        pipeline: { select: { id: true, name: true, type: true } },
        stage: { select: { id: true, name: true, color: true, probability: true } },
        tasks: {
          orderBy: { dueDate: 'asc' },
          take: 5,
        },
        notes: {
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
        historyEvents: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        conversations: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
        interestedProperties: {
          include: {
            property: {
              select: { id: true, code: true, type: true, neighborhood: true, salePrice: true, rentPrice: true },
            },
          },
        },
      },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    return lead
  }

  async create(companyId: string, userId: string, dto: CreateLeadDto) {
    // Check for duplicates by phone
    const duplicateCheck = await this.checkDuplicates(companyId, dto.phone, dto.email)
    if (duplicateCheck.hasDuplicate && !dto.ignoreDuplicate) {
      throw new ConflictException({
        message: 'Lead duplicado encontrado',
        duplicate: duplicateCheck.existingLead,
      })
    }

    // Get default pipeline and first stage if not provided
    let pipelineId = dto.pipelineId
    let stageId = dto.stageId

    if (!pipelineId) {
      const defaultPipeline = await this.prisma.pipeline.findFirst({
        where: { companyId, isDefault: true },
        include: { stages: { orderBy: { order: 'asc' }, take: 1 } },
      })

      if (!defaultPipeline) {
        throw new BadRequestException('Nenhum pipeline padrão encontrado')
      }

      pipelineId = defaultPipeline.id
      stageId = stageId || defaultPipeline.stages[0]?.id
    }

    if (!stageId) {
      const firstStage = await this.prisma.stage.findFirst({
        where: { pipelineId },
        orderBy: { order: 'asc' },
      })
      stageId = firstStage?.id
    }

    if (!stageId) {
      throw new BadRequestException('Nenhuma etapa encontrada no pipeline')
    }

    const lead = await this.prisma.lead.create({
      data: {
        companyId,
        userId: dto.userId || userId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        cpf: dto.cpf,
        clientType: dto.clientType,
        origin: dto.origin,
        temperature: (dto.temperature || 'COLD') as any,
        priority: (dto.priority || 'MEDIUM') as any,
        tags: dto.tags || [],
        propertyTypes: dto.propertyTypes || [],
        minValue: dto.minValue,
        maxValue: dto.maxValue,
        neighborhoods: dto.neighborhoods || [],
        bedrooms: dto.bedrooms,
        suites: dto.suites,
        parkingSpots: dto.parkingSpots,
        minArea: dto.minArea,
        features: dto.features || [],
        paymentType: dto.paymentType,
        hasPropertySwap: dto.hasPropertySwap,
        financingStatus: dto.financingStatus,
        monthlyIncome: dto.monthlyIncome,
        purchaseDeadline: dto.purchaseDeadline,
        pipelineId,
        stageId,
        estimatedValue: dto.estimatedValue,
        nextAction: dto.nextAction,
        nextActionDate: dto.nextActionDate ? new Date(dto.nextActionDate) : undefined,
      },
      include: {
        stage: { select: { id: true, name: true, color: true } },
        pipeline: { select: { id: true, name: true } },
      },
    })

    // Create history event
    await this.createHistoryEvent(lead.id, userId, 'LEAD_CREATED', {
      origin: dto.origin,
      ignoredDuplicate: dto.ignoreDuplicate,
    })

    this.notifications
      .createNotification(
        lead.userId,
        companyId,
        'NEW_LEAD',
        `Novo lead: ${lead.name}`,
        'Um novo lead foi adicionado ao pipeline',
        { leadId: lead.id },
      )
      .catch(() => {})

    return lead
  }

  async update(id: string, companyId: string, userId: string, dto: UpdateLeadDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        ...dto,
        temperature: dto.temperature as any,
        priority: dto.priority as any,
        nextActionDate: dto.nextActionDate ? new Date(dto.nextActionDate) : undefined,
        updatedAt: new Date(),
      } as any,
      include: {
        stage: { select: { id: true, name: true, color: true } },
        pipeline: { select: { id: true, name: true } },
      },
    })

    // Create history event for important changes
    const changes: any = {}
    if (dto.temperature && dto.temperature !== lead.temperature) {
      changes.temperature = { from: lead.temperature, to: dto.temperature }
    }
    if (dto.userId && dto.userId !== lead.userId) {
      changes.userId = { from: lead.userId, to: dto.userId }
    }
    if (dto.estimatedValue && dto.estimatedValue !== lead.estimatedValue) {
      changes.estimatedValue = { from: lead.estimatedValue, to: dto.estimatedValue }
    }

    if (Object.keys(changes).length > 0) {
      await this.createHistoryEvent(id, userId, 'LEAD_UPDATED', changes)
    }

    return updatedLead
  }

  async delete(id: string, companyId: string, userId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    // Soft delete - archive
    return this.prisma.lead.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    })
  }

  // ================== DUPLICITY CHECK ==================

  async checkDuplicates(companyId: string, phone: string, email?: string) {
    const conditions: any[] = [{ phone }]
    if (email) {
      conditions.push({ email })
    }

    const existingLead = await this.prisma.lead.findFirst({
      where: {
        companyId,
        OR: conditions,
        status: { not: 'ARCHIVED' },
      },
      include: {
        stage: { select: { name: true } },
      },
    })

    return {
      hasDuplicate: !!existingLead,
      existingLead: existingLead
        ? {
            id: existingLead.id,
            name: existingLead.name,
            phone: existingLead.phone,
            email: existingLead.email,
            userId: existingLead.userId,
            stage: existingLead.stage?.name,
            status: existingLead.status,
            createdAt: existingLead.createdAt,
          }
        : null,
    }
  }

  // ================== STAGE MOVEMENT ==================

  async moveStage(id: string, companyId: string, userId: string, dto: MoveStageDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: { stage: true },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    const newStage = await this.prisma.stage.findFirst({
      where: { id: dto.stageId },
    })

    if (!newStage) {
      throw new NotFoundException('Etapa não encontrada')
    }

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        stageId: dto.stageId,
        pipelineId: newStage.pipelineId,
        probability: newStage.probability,
        lastInteraction: new Date(),
      },
      include: {
        stage: { select: { id: true, name: true, color: true } },
        pipeline: { select: { id: true, name: true } },
      },
    })

    // Create history event
    await this.createHistoryEvent(id, userId, 'STAGE_CHANGED', {
      fromStage: { id: lead.stageId, name: lead.stage.name },
      toStage: { id: newStage.id, name: newStage.name },
    })

    this.flowExecutor.onLeadStageChanged(id, lead.stageId, dto.stageId, companyId).catch(() => {})

    this.notifications
      .createNotification(
        lead.userId,
        companyId,
        'LEAD_STAGE_CHANGED',
        'Lead movido',
        `${lead.name} foi movido para ${updatedLead.stage?.name || newStage.name}`,
        { leadId: id, stageId: dto.stageId },
      )
      .catch(() => {})

    return updatedLead
  }

  async markAsWon(id: string, companyId: string, userId: string, dto: MarkWonDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: { pipeline: { include: { stages: true } } },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    const wonStage = lead.pipeline.stages.find(s => s.type === 'WON')
    if (!wonStage) {
      throw new BadRequestException('Etapa "Ganho" não encontrada no pipeline')
    }

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        status: 'WON',
        stageId: wonStage.id,
        closedValue: dto.closedValue,
        closedAt: new Date(),
        probability: 100,
      },
      include: {
        stage: { select: { id: true, name: true, color: true } },
      },
    })

    await this.createHistoryEvent(id, userId, 'LEAD_WON', {
      closedValue: dto.closedValue,
    })

    return updatedLead
  }

  async markAsLost(id: string, companyId: string, userId: string, dto: MarkLostDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: { pipeline: { include: { stages: true } } },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    const lostStage = lead.pipeline.stages.find(s => s.type === 'LOST')
    if (!lostStage) {
      throw new BadRequestException('Etapa "Perdido" não encontrada no pipeline')
    }

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        status: 'LOST',
        stageId: lostStage.id,
        lostReason: dto.lostReason,
        lostNote: dto.note,
        probability: 0,
      },
      include: {
        stage: { select: { id: true, name: true, color: true } },
      },
    })

    await this.createHistoryEvent(id, userId, 'LEAD_LOST', {
      lostReason: dto.lostReason,
      note: dto.note,
    })

    return updatedLead
  }

  async reactivate(id: string, companyId: string, userId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: { pipeline: { include: { stages: { orderBy: { order: 'asc' } } } } },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    const firstStage = lead.pipeline.stages.find(s => s.type === 'INITIAL') || lead.pipeline.stages[0]

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        stageId: firstStage.id,
        lostReason: null,
        lostNote: null,
        closedValue: null,
        closedAt: null,
        probability: firstStage.probability,
      },
      include: {
        stage: { select: { id: true, name: true, color: true } },
      },
    })

    await this.createHistoryEvent(id, userId, 'LEAD_REACTIVATED', {})

    return updatedLead
  }

  async toggleFavorite(id: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    return this.prisma.lead.update({
      where: { id },
      data: { isFavorite: !lead.isFavorite },
    })
  }

  // ================== NOTES ==================

  async addNote(leadId: string, companyId: string, userId: string, dto: CreateNoteDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    const note = await this.prisma.note.create({
      data: {
        leadId,
        userId,
        content: dto.content,
        isPinned: dto.isPinned || false,
      },
    })

    await this.createHistoryEvent(leadId, userId, 'NOTE_ADDED', {
      noteId: note.id,
    })

    return note
  }

  async updateNote(noteId: string, companyId: string, userId: string, content: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId },
      include: { lead: true },
    })

    if (!note || note.lead.companyId !== companyId) {
      throw new NotFoundException('Anotação não encontrada')
    }

    const updatedNote = await this.prisma.note.update({
      where: { id: noteId },
      data: { content },
    })

    await this.createHistoryEvent(note.leadId, userId, 'NOTE_EDITED', {
      noteId,
    })

    return updatedNote
  }

  async togglePinNote(noteId: string, companyId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId },
      include: { lead: true },
    })

    if (!note || note.lead.companyId !== companyId) {
      throw new NotFoundException('Anotação não encontrada')
    }

    return this.prisma.note.update({
      where: { id: noteId },
      data: { isPinned: !note.isPinned },
    })
  }

  async deleteNote(noteId: string, companyId: string, userId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId },
      include: { lead: true },
    })

    if (!note || note.lead.companyId !== companyId) {
      throw new NotFoundException('Anotação não encontrada')
    }

    await this.prisma.note.delete({ where: { id: noteId } })

    await this.createHistoryEvent(note.leadId, userId, 'NOTE_DELETED', {
      noteId,
    })

    return { success: true }
  }

  // ================== ATTACHMENTS ==================

  async addAttachment(leadId: string, companyId: string, userId: string, fileData: any) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    const attachment = await this.prisma.attachment.create({
      data: {
        leadId,
        userId,
        name: fileData.name,
        url: fileData.url,
        size: fileData.size,
        mimeType: fileData.mimeType,
      },
    })

    await this.createHistoryEvent(leadId, userId, 'ATTACHMENT_ADDED', {
      attachmentId: attachment.id,
      fileName: fileData.name,
    })

    return attachment
  }

  async deleteAttachment(attachmentId: string, companyId: string, userId: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId },
      include: { lead: true },
    })

    if (!attachment || attachment.lead.companyId !== companyId) {
      throw new NotFoundException('Anexo não encontrado')
    }

    await this.prisma.attachment.delete({ where: { id: attachmentId } })

    await this.createHistoryEvent(attachment.leadId, userId, 'ATTACHMENT_DELETED', {
      attachmentId,
      fileName: attachment.name,
    })

    return { success: true }
  }

  // ================== TIMELINE / HISTORY ==================

  async getTimeline(leadId: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    return this.prisma.leadHistory.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    })
  }

  private async createHistoryEvent(leadId: string, userId: string, event: string, metadata: any) {
    return this.prisma.leadHistory.create({
      data: {
        leadId,
        userId,
        event,
        metadata,
      },
    })
  }

  // ================== BULK OPERATIONS ==================

  async bulkUpdateStage(companyId: string, userId: string, leadIds: string[], stageId: string) {
    const stage = await this.prisma.stage.findFirst({
      where: { id: stageId },
      include: { pipeline: true },
    })

    if (!stage || stage.pipeline.companyId !== companyId) {
      throw new NotFoundException('Etapa não encontrada')
    }

    await this.prisma.lead.updateMany({
      where: { id: { in: leadIds }, companyId },
      data: {
        stageId,
        pipelineId: stage.pipelineId,
        probability: stage.probability,
      },
    })

    await this.prisma.leadHistory.createMany({
      data: leadIds.map((leadId) => ({
        leadId,
        userId,
        event: 'STAGE_CHANGED',
        metadata: { toStage: { id: stage.id, name: stage.name }, bulk: true },
      })),
    })

    return { success: true, count: leadIds.length }
  }

  async bulkAssign(companyId: string, currentUserId: string, leadIds: string[], newUserId: string) {
    await this.prisma.lead.updateMany({
      where: { id: { in: leadIds }, companyId },
      data: { userId: newUserId },
    })

    await this.prisma.leadHistory.createMany({
      data: leadIds.map((leadId) => ({
        leadId,
        userId: currentUserId,
        event: 'LEAD_ASSIGNED',
        metadata: { toUserId: newUserId, bulk: true },
      })),
    })

    return { success: true, count: leadIds.length }
  }

  // ================== STATS ==================

  async getStats(companyId: string, userId?: string) {
    const where: any = { companyId }
    if (userId) where.userId = userId

    const [total, active, won, lost, hot, warm, cold] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.count({ where: { ...where, status: 'ACTIVE' } }),
      this.prisma.lead.count({ where: { ...where, status: 'WON' } }),
      this.prisma.lead.count({ where: { ...where, status: 'LOST' } }),
      this.prisma.lead.count({ where: { ...where, temperature: 'HOT', status: 'ACTIVE' } }),
      this.prisma.lead.count({ where: { ...where, temperature: 'WARM', status: 'ACTIVE' } }),
      this.prisma.lead.count({ where: { ...where, temperature: 'COLD', status: 'ACTIVE' } }),
    ])

    const { _sum } = await this.prisma.lead.aggregate({
      where: { ...where, status: 'WON' },
      _sum: { closedValue: true },
    })
    const totalWonValue = _sum.closedValue ?? 0
    const conversionRate = total > 0 ? (won / total) * 100 : 0

    return {
      total,
      active,
      won,
      lost,
      totalWonValue,
      conversionRate: Math.round(conversionRate * 100) / 100,
      byTemperature: { hot, warm, cold },
    }
  }
}
