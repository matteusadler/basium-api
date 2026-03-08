import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreatePipelineDto } from './dto/create-pipeline.dto'
import { UpdatePipelineDto } from './dto/update-pipeline.dto'
import { CreateStageDto } from './dto/create-stage.dto'
import { UpdateStageDto } from './dto/update-stage.dto'

@Injectable()
export class PipelinesService {
  constructor(private prisma: PrismaService) {}

  // ================== PIPELINES ==================

  async findAll(companyId: string) {
    return this.prisma.pipeline.findMany({
      where: { companyId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { leads: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, companyId: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, companyId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { leads: true },
            },
          },
        },
      },
    })

    if (!pipeline) {
      throw new NotFoundException('Pipeline não encontrado')
    }

    return pipeline
  }

  async create(companyId: string, dto: CreatePipelineDto) {
    // If this is set as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.pipeline.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const defaultStages = [
      { name: 'Novo Lead', color: '#6366f1', order: 1, probability: 10, type: 'INITIAL' },
      { name: 'Contato Feito', color: '#8b5cf6', order: 2, probability: 25, type: 'INTERMEDIATE' },
      { name: 'Qualificado', color: '#a855f7', order: 3, probability: 50, type: 'INTERMEDIATE' },
      { name: 'Proposta', color: '#c084fc', order: 4, probability: 75, type: 'INTERMEDIATE' },
      { name: 'Ganho', color: '#10b981', order: 5, probability: 100, type: 'WON' },
      { name: 'Perdido', color: '#ef4444', order: 6, probability: 0, type: 'LOST' },
    ]

    const stagesToCreate = dto.stages
      ? dto.stages.map((s, index) => ({
          name: s.name,
          color: s.color || '#6366f1',
          order: s.order || index + 1,
          probability: s.probability || 50,
          type: s.type || 'INTERMEDIATE',
        }))
      : defaultStages

    return this.prisma.pipeline.create({
      data: {
        companyId,
        name: dto.name,
        type: dto.type,
        isDefault: dto.isDefault || false,
        stages: {
          create: stagesToCreate,
        },
      },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    })
  }

  async update(id: string, companyId: string, dto: UpdatePipelineDto) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, companyId },
    })

    if (!pipeline) {
      throw new NotFoundException('Pipeline não encontrado')
    }

    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.pipeline.updateMany({
        where: { companyId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    return this.prisma.pipeline.update({
      where: { id },
      data: dto,
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    })
  }

  async delete(id: string, companyId: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, companyId },
      include: { _count: { select: { leads: true } } },
    })

    if (!pipeline) {
      throw new NotFoundException('Pipeline não encontrado')
    }

    if (pipeline._count.leads > 0) {
      throw new BadRequestException('Não é possível excluir pipeline com leads vinculados')
    }

    return this.prisma.pipeline.delete({
      where: { id },
    })
  }

  async getDefault(companyId: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { companyId, isDefault: true },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!pipeline) {
      // Return first pipeline if no default
      return this.prisma.pipeline.findFirst({
        where: { companyId },
        include: {
          stages: {
            orderBy: { order: 'asc' },
          },
        },
      })
    }

    return pipeline
  }

  // ================== STAGES ==================

  async createStage(pipelineId: string, companyId: string, dto: CreateStageDto) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId, companyId },
      include: { stages: { orderBy: { order: 'desc' }, take: 1 } },
    })

    if (!pipeline) {
      throw new NotFoundException('Pipeline não encontrado')
    }

    const maxOrder = pipeline.stages[0]?.order || 0

    return this.prisma.stage.create({
      data: {
        pipelineId,
        name: dto.name,
        color: dto.color || '#6366f1',
        order: dto.order || maxOrder + 1,
        probability: dto.probability || 50,
        type: dto.type || 'INTERMEDIATE',
      },
    })
  }

  async updateStage(stageId: string, companyId: string, dto: UpdateStageDto) {
    const stage = await this.prisma.stage.findFirst({
      where: { id: stageId },
      include: { pipeline: true },
    })

    if (!stage || stage.pipeline.companyId !== companyId) {
      throw new NotFoundException('Etapa não encontrada')
    }

    return this.prisma.stage.update({
      where: { id: stageId },
      data: dto,
    })
  }

  async deleteStage(stageId: string, companyId: string) {
    const stage = await this.prisma.stage.findFirst({
      where: { id: stageId },
      include: {
        pipeline: true,
        _count: { select: { leads: true } },
      },
    })

    if (!stage || stage.pipeline.companyId !== companyId) {
      throw new NotFoundException('Etapa não encontrada')
    }

    if (stage._count.leads > 0) {
      throw new BadRequestException('Não é possível excluir etapa com leads vinculados')
    }

    return this.prisma.stage.delete({
      where: { id: stageId },
    })
  }

  async reorderStages(pipelineId: string, companyId: string, stageIds: string[]) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId, companyId },
    })

    if (!pipeline) {
      throw new NotFoundException('Pipeline não encontrado')
    }

    // Update order for each stage
    const updates = stageIds.map((stageId, index) =>
      this.prisma.stage.update({
        where: { id: stageId },
        data: { order: index + 1 },
      })
    )

    await this.prisma.$transaction(updates)

    return this.findOne(pipelineId, companyId)
  }

  // ================== KANBAN STATS ==================

  async getKanbanStats(pipelineId: string, companyId: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId, companyId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            leads: {
              where: { status: 'ACTIVE' },
              select: {
                id: true,
                estimatedValue: true,
                probability: true,
              },
            },
          },
        },
      },
    })

    if (!pipeline) {
      throw new NotFoundException('Pipeline não encontrado')
    }

    return pipeline.stages.map(stage => {
      const totalValue = stage.leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0)
      const weightedValue = stage.leads.reduce(
        (sum, lead) => sum + ((lead.estimatedValue || 0) * (lead.probability || stage.probability) / 100),
        0
      )

      return {
        stageId: stage.id,
        stageName: stage.name,
        stageColor: stage.color,
        leadCount: stage.leads.length,
        totalValue,
        weightedValue,
      }
    })
  }
}
