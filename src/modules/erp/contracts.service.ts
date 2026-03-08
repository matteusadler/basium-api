import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class ContractsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async findAll(companyId: string, filters?: any) {
    const where: any = { companyId }
    
    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status
    if (filters?.propertyId) where.propertyId = filters.propertyId
    if (filters?.leadId) where.leadId = filters.leadId

    return this.prisma.contract.findMany({
      where,
      include: {
        property: { select: { id: true, code: true, street: true, number: true, city: true } },
        lead: { select: { id: true, name: true, phone: true, email: true } },
        _count: { select: { financialEntries: true, commissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, companyId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, companyId },
      include: {
        property: {
          include: {
            owners: { include: { owner: true } },
            media: { where: { isCover: true }, take: 1 },
          },
        },
        lead: true,
        documents: { orderBy: { uploadedAt: 'desc' } },
        commissions: { orderBy: { createdAt: 'desc' } },
        financialEntries: { orderBy: { dueDate: 'asc' }, take: 12 },
        adjustmentHistory: { orderBy: { appliedAt: 'desc' }, take: 5 },
      },
    })

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado')
    }

    return contract
  }

  async create(companyId: string, userId: string, dto: any) {
    // Validate property exists
    const property = await this.prisma.property.findFirst({
      where: { id: dto.propertyId, companyId },
    })

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado')
    }

    // Validate lead exists
    const lead = await this.prisma.lead.findFirst({
      where: { id: dto.leadId, companyId },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    // Check for existing active contract on property
    if (dto.type === 'RENTAL') {
      const existingContract = await this.prisma.contract.findFirst({
        where: {
          propertyId: dto.propertyId,
          status: 'ACTIVE',
          type: 'RENTAL',
        },
      })

      if (existingContract) {
        throw new BadRequestException('Imóvel já possui contrato de locação ativo')
      }
    }

    const contract = await this.prisma.contract.create({
      data: {
        companyId,
        type: dto.type,
        status: dto.status || 'PENDING',
        propertyId: dto.propertyId,
        leadId: dto.leadId,
        brokerId: dto.brokerId || userId,
        captorId: dto.captorId,
        // Sale specific
        salePrice: dto.salePrice,
        paymentType: dto.paymentType,
        bankName: dto.bankName,
        financedAmount: dto.financedAmount,
        interestRate: dto.interestRate,
        termMonths: dto.termMonths,
        signedAt: dto.signedAt ? new Date(dto.signedAt) : null,
        deedAt: dto.deedAt ? new Date(dto.deedAt) : null,
        keysDeliveredAt: dto.keysDeliveredAt ? new Date(dto.keysDeliveredAt) : null,
        // Rental specific
        rentAmount: dto.rentAmount,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        durationMonths: dto.durationMonths,
        dueDayOfMonth: dto.dueDayOfMonth,
        adjustmentIndex: dto.adjustmentIndex,
        adjustmentFrequency: dto.adjustmentFrequency,
        nextAdjustmentDate: dto.nextAdjustmentDate ? new Date(dto.nextAdjustmentDate) : null,
        guaranteeType: dto.guaranteeType,
        depositAmount: dto.depositAmount,
        penaltyPct: dto.penaltyPct,
      },
    })

    // Update property status
    if (dto.type === 'SALE' && dto.status === 'ACTIVE') {
      await this.prisma.property.update({
        where: { id: dto.propertyId },
        data: { status: 'SOLD' },
      })
    } else if (dto.type === 'RENTAL' && dto.status === 'ACTIVE') {
      await this.prisma.property.update({
        where: { id: dto.propertyId },
        data: { status: 'RENTED' },
      })
    }

    // Mark lead as won if contract is active
    if (dto.status === 'ACTIVE') {
      await this.prisma.lead.update({
        where: { id: dto.leadId },
        data: {
          status: 'WON',
          closedValue: dto.type === 'SALE' ? dto.salePrice : dto.rentAmount * (dto.durationMonths || 12),
          closedAt: new Date(),
        },
      })
    }

    return contract
  }

  async update(id: string, companyId: string, dto: any) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, companyId },
      include: { lead: { select: { name: true } } },
    })

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado')
    }

    const newStatus = dto.status as string | undefined
    const wasSignedOrActive =
      contract.status === 'SIGNED' || contract.status === 'ACTIVE'
    const becomesSignedOrActive =
      newStatus === 'SIGNED' || newStatus === 'ACTIVE'

    const updated = await this.prisma.contract.update({
      where: { id },
      data: {
        ...dto,
        signedAt: dto.signedAt ? new Date(dto.signedAt) : undefined,
        deedAt: dto.deedAt ? new Date(dto.deedAt) : undefined,
        keysDeliveredAt: dto.keysDeliveredAt ? new Date(dto.keysDeliveredAt) : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        nextAdjustmentDate: dto.nextAdjustmentDate ? new Date(dto.nextAdjustmentDate) : undefined,
      },
    })

    if (!wasSignedOrActive && becomesSignedOrActive && contract.brokerId) {
      const leadName = contract.lead?.name || 'Contrato'
      this.notifications
        .createNotification(
          contract.brokerId,
          companyId,
          'CONTRACT_SIGNED',
          'Contrato assinado',
          `Contrato de ${leadName} foi assinado`,
          { contractId: id },
        )
        .catch(() => {})
    }

    return updated
  }

  async delete(id: string, companyId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, companyId },
    })

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado')
    }

    if (contract.status === 'ACTIVE') {
      throw new BadRequestException('Não é possível excluir contrato ativo')
    }

    return this.prisma.contract.delete({ where: { id } })
  }

  async addDocument(id: string, companyId: string, docData: any) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, companyId },
    })

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado')
    }

    return this.prisma.contractDocument.create({
      data: {
        contractId: id,
        name: docData.name,
        url: docData.url,
        type: docData.type,
      },
    })
  }

  async generateRentalEntries(id: string, companyId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, companyId, type: 'RENTAL' },
    })

    if (!contract) {
      throw new NotFoundException('Contrato de locação não encontrado')
    }

    if (!contract.startDate || !contract.durationMonths || !contract.rentAmount) {
      throw new BadRequestException('Contrato não possui dados suficientes para gerar parcelas')
    }

    const entries = []
    const startDate = new Date(contract.startDate)

    for (let i = 0; i < contract.durationMonths; i++) {
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + i)
      if (contract.dueDayOfMonth) {
        dueDate.setDate(contract.dueDayOfMonth)
      }

      entries.push({
        companyId,
        contractId: id,
        type: 'INCOME',
        category: 'RENT',
        description: `Aluguel ${i + 1}/${contract.durationMonths}`,
        amount: contract.rentAmount,
        dueDate,
        status: 'PENDING',
      })
    }

    await this.prisma.financialEntry.createMany({ data: entries })

    return { created: entries.length }
  }

  async getStats(companyId: string) {
    const [total, active, pending, completed] = await Promise.all([
      this.prisma.contract.count({ where: { companyId } }),
      this.prisma.contract.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.contract.count({ where: { companyId, status: 'PENDING' } }),
      this.prisma.contract.count({ where: { companyId, status: 'COMPLETED' } }),
    ])

    const totalValue = await this.prisma.contract.aggregate({
      where: { companyId, status: 'ACTIVE' },
      _sum: { salePrice: true, rentAmount: true },
    })

    return {
      total,
      active,
      pending,
      completed,
      totalSaleValue: totalValue._sum.salePrice || 0,
      totalRentValue: totalValue._sum.rentAmount || 0,
    }
  }
}
