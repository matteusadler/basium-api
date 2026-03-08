import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class OwnersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.owner.findMany({
      where: { companyId },
      include: {
        properties: {
          include: {
            property: { select: { id: true, code: true, street: true, number: true, city: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string, companyId: string) {
    const owner = await this.prisma.owner.findFirst({
      where: { id, companyId },
      include: {
        properties: {
          include: {
            property: {
              include: {
                contracts: { where: { status: 'ACTIVE' }, take: 1 },
              },
            },
          },
        },
      },
    })

    if (!owner) {
      throw new NotFoundException('Proprietário não encontrado')
    }

    return owner
  }

  async create(companyId: string, dto: any) {
    return this.prisma.owner.create({
      data: {
        companyId,
        name: dto.name,
        cpfCnpj: dto.cpfCnpj,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        bankName: dto.bankName,
        bankAgency: dto.bankAgency,
        bankAccount: dto.bankAccount,
        accountType: dto.accountType,
        pixKey: dto.pixKey,
        pixKeyType: dto.pixKeyType,
      },
    })
  }

  async update(id: string, companyId: string, dto: any) {
    const owner = await this.prisma.owner.findFirst({
      where: { id, companyId },
    })

    if (!owner) {
      throw new NotFoundException('Proprietário não encontrado')
    }

    return this.prisma.owner.update({
      where: { id },
      data: dto,
    })
  }

  async delete(id: string, companyId: string) {
    const owner = await this.prisma.owner.findFirst({
      where: { id, companyId },
    })

    if (!owner) {
      throw new NotFoundException('Proprietário não encontrado')
    }

    // Check if owner has active contracts
    const hasActiveContracts = await this.prisma.propertyOwner.findFirst({
      where: {
        ownerId: id,
        property: {
          contracts: { some: { status: 'ACTIVE' } },
        },
      },
    })

    if (hasActiveContracts) {
      throw new Error('Proprietário possui contratos ativos e não pode ser removido')
    }

    return this.prisma.owner.delete({ where: { id } })
  }

  async linkToProperty(ownerId: string, propertyId: string, companyId: string, ownershipPct: number = 100) {
    const owner = await this.prisma.owner.findFirst({
      where: { id: ownerId, companyId },
    })

    if (!owner) {
      throw new NotFoundException('Proprietário não encontrado')
    }

    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, companyId },
    })

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado')
    }

    return this.prisma.propertyOwner.create({
      data: {
        ownerId,
        propertyId,
        ownershipPct,
      },
    })
  }

  async unlinkFromProperty(ownerId: string, propertyId: string, companyId: string) {
    const link = await this.prisma.propertyOwner.findFirst({
      where: {
        ownerId,
        propertyId,
        property: { companyId },
      },
    })

    if (!link) {
      throw new NotFoundException('Vínculo não encontrado')
    }

    return this.prisma.propertyOwner.delete({
      where: { id: link.id },
    })
  }
}
