import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, filters?: any) {
    const where: any = { companyId }
    
    if (filters?.status) where.status = filters.status
    if (filters?.contractId) where.contractId = filters.contractId
    if (filters?.recipientId) where.recipientId = filters.recipientId

    return this.prisma.commission.findMany({
      where,
      include: {
        contract: {
          select: {
            id: true,
            type: true,
            property: { select: { code: true, street: true, number: true } },
            lead: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, companyId: string) {
    const commission = await this.prisma.commission.findFirst({
      where: { id, companyId },
      include: {
        contract: {
          include: {
            property: true,
            lead: true,
          },
        },
      },
    })

    if (!commission) {
      throw new NotFoundException('Comissão não encontrada')
    }

    return commission
  }

  async create(companyId: string, dto: any) {
    // Validate contract exists
    const contract = await this.prisma.contract.findFirst({
      where: { id: dto.contractId, companyId },
    })

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado')
    }

    const amount = (dto.baseValue * dto.percentage) / 100

    return this.prisma.commission.create({
      data: {
        companyId,
        contractId: dto.contractId,
        recipientId: dto.recipientId,
        recipientType: dto.recipientType,
        recipientName: dto.recipientName,
        baseValue: dto.baseValue,
        percentage: dto.percentage,
        amount,
        status: dto.status || 'PENDING',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    })
  }

  async markPaid(id: string, companyId: string) {
    const commission = await this.prisma.commission.findFirst({
      where: { id, companyId },
    })

    if (!commission) {
      throw new NotFoundException('Comissão não encontrada')
    }

    return this.prisma.commission.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    })
  }

  async delete(id: string, companyId: string) {
    const commission = await this.prisma.commission.findFirst({
      where: { id, companyId },
    })

    if (!commission) {
      throw new NotFoundException('Comissão não encontrada')
    }

    if (commission.status === 'PAID') {
      throw new Error('Não é possível excluir comissão já paga')
    }

    return this.prisma.commission.delete({ where: { id } })
  }

  async generateForContract(companyId: string, contractId: string, commissionRules: any[]) {
    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId, companyId },
    })

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado')
    }

    const baseValue = contract.type === 'SALE' 
      ? (contract.salePrice || 0)
      : (contract.rentAmount || 0)

    const commissions = []
    for (const rule of commissionRules) {
      const amount = (baseValue * rule.percentage) / 100
      
      commissions.push({
        companyId,
        contractId,
        recipientId: rule.recipientId,
        recipientType: rule.recipientType,
        recipientName: rule.recipientName,
        baseValue,
        percentage: rule.percentage,
        amount,
        status: 'PENDING',
        dueDate: rule.dueDate ? new Date(rule.dueDate) : null,
      })
    }

    if (commissions.length > 0) {
      await this.prisma.commission.createMany({ data: commissions })
    }

    return { created: commissions.length }
  }

  async getSummary(companyId: string) {
    const [total, pending, paid] = await Promise.all([
      this.prisma.commission.aggregate({
        where: { companyId },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.commission.aggregate({
        where: { companyId, status: 'PENDING' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.commission.aggregate({
        where: { companyId, status: 'PAID' },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    return {
      totalAmount: total._sum.amount || 0,
      totalCount: total._count || 0,
      pendingAmount: pending._sum.amount || 0,
      pendingCount: pending._count || 0,
      paidAmount: paid._sum.amount || 0,
      paidCount: paid._count || 0,
    }
  }

  async getByRecipient(companyId: string) {
    const commissions = await this.prisma.commission.groupBy({
      by: ['recipientId', 'recipientName', 'recipientType'],
      where: { companyId },
      _sum: { amount: true },
      _count: true,
    })

    return commissions.map(c => ({
      recipientId: c.recipientId,
      recipientName: c.recipientName,
      recipientType: c.recipientType,
      totalAmount: c._sum.amount || 0,
      count: c._count,
    }))
  }
}
