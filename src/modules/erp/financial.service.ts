import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, filters?: any) {
    const where: any = { companyId }
    
    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status
    if (filters?.category) where.category = filters.category
    if (filters?.contractId) where.contractId = filters.contractId

    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {}
      if (filters.startDate) where.dueDate.gte = new Date(filters.startDate)
      if (filters.endDate) where.dueDate.lte = new Date(filters.endDate)
    }

    return this.prisma.financialEntry.findMany({
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
      orderBy: { dueDate: 'asc' },
    })
  }

  async findOne(id: string, companyId: string) {
    const entry = await this.prisma.financialEntry.findFirst({
      where: { id, companyId },
      include: {
        contract: {
          include: {
            property: {
              include: {
                owners: { include: { owner: true } },
              },
            },
            lead: true,
          },
        },
      },
    })

    if (!entry) {
      throw new NotFoundException('Lançamento financeiro não encontrado')
    }

    return entry
  }

  async create(companyId: string, dto: any) {
    return this.prisma.financialEntry.create({
      data: {
        companyId,
        contractId: dto.contractId,
        type: dto.type,
        category: dto.category,
        description: dto.description,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        status: dto.status || 'PENDING',
        paymentMethod: dto.paymentMethod,
        notes: dto.notes,
      },
    })
  }

  async update(id: string, companyId: string, dto: any) {
    const entry = await this.prisma.financialEntry.findFirst({
      where: { id, companyId },
    })

    if (!entry) {
      throw new NotFoundException('Lançamento financeiro não encontrado')
    }

    return this.prisma.financialEntry.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      },
    })
  }

  async markPaid(id: string, companyId: string, paymentData?: any) {
    const entry = await this.prisma.financialEntry.findFirst({
      where: { id, companyId },
    })

    if (!entry) {
      throw new NotFoundException('Lançamento financeiro não encontrado')
    }

    return this.prisma.financialEntry.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: paymentData?.paidAt ? new Date(paymentData.paidAt) : new Date(),
        paymentMethod: paymentData?.paymentMethod || 'OTHER',
      },
    })
  }

  async delete(id: string, companyId: string) {
    const entry = await this.prisma.financialEntry.findFirst({
      where: { id, companyId },
    })

    if (!entry) {
      throw new NotFoundException('Lançamento financeiro não encontrado')
    }

    return this.prisma.financialEntry.delete({ where: { id } })
  }

  async generateOwnerTransfer(companyId: string, contractId: string, month: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId, companyId, type: 'RENTAL' },
      include: {
        property: {
          include: {
            owners: { include: { owner: true } },
          },
        },
      },
    })

    if (!contract) {
      throw new NotFoundException('Contrato de locação não encontrado')
    }

    // Get rent payment for the month
    const [year, monthNum] = month.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0)

    const rentEntry = await this.prisma.financialEntry.findFirst({
      where: {
        contractId,
        category: 'RENT',
        dueDate: { gte: startDate, lte: endDate },
        status: 'PAID',
      },
    })

    if (!rentEntry) {
      throw new NotFoundException('Aluguel do mês ainda não foi pago')
    }

    const rentAmount = rentEntry.amount

    // Calculate transfers for each owner
    const transfers = []
    for (const propertyOwner of contract.property.owners) {
      const ownerAmount = (rentAmount * propertyOwner.ownershipPct) / 100
      
      transfers.push({
        companyId,
        contractId,
        type: 'EXPENSE',
        category: 'OWNER_TRANSFER',
        description: `Repasse - ${propertyOwner.owner.name} (${propertyOwner.ownershipPct}%) - ${month}`,
        amount: ownerAmount,
        dueDate: new Date(),
        status: 'PENDING',
      })
    }

    if (transfers.length > 0) {
      await this.prisma.financialEntry.createMany({ data: transfers })
    }

    return { 
      created: transfers.length,
      totalAmount: transfers.reduce((sum, t) => sum + t.amount, 0),
    }
  }

  async getSummary(companyId: string, filters?: any) {
    const where: any = { companyId }

    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {}
      if (filters.startDate) where.dueDate.gte = new Date(filters.startDate)
      if (filters.endDate) where.dueDate.lte = new Date(filters.endDate)
    }

    const [income, expenses, pending, overdue] = await Promise.all([
      this.prisma.financialEntry.aggregate({
        where: { ...where, type: 'INCOME', status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.financialEntry.aggregate({
        where: { ...where, type: 'EXPENSE', status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.financialEntry.aggregate({
        where: { ...where, status: 'PENDING' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.financialEntry.aggregate({
        where: { ...where, status: 'PENDING', dueDate: { lt: new Date() } },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    const totalIncome = income._sum.amount || 0
    const totalExpenses = expenses._sum.amount || 0

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      pendingAmount: pending._sum.amount || 0,
      pendingCount: pending._count || 0,
      overdueAmount: overdue._sum.amount || 0,
      overdueCount: overdue._count || 0,
    }
  }

  async getByCategory(companyId: string, filters?: any) {
    const where: any = { companyId, status: 'PAID' }

    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {}
      if (filters.startDate) where.dueDate.gte = new Date(filters.startDate)
      if (filters.endDate) where.dueDate.lte = new Date(filters.endDate)
    }

    const entries = await this.prisma.financialEntry.groupBy({
      by: ['category', 'type'],
      where,
      _sum: { amount: true },
      _count: true,
    })

    return entries.map(e => ({
      category: e.category,
      type: e.type,
      total: e._sum.amount || 0,
      count: e._count,
    }))
  }
}
