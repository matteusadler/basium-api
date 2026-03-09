import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, filters?: any) {
    const where: any = { companyId }
    
    if (filters?.type) where.type = filters.type
    if (filters?.purpose) where.purpose = filters.purpose
    if (filters?.status) where.status = filters.status
    if (filters?.city) where.city = filters.city
    if (filters?.neighborhood) where.neighborhood = filters.neighborhood
    if (filters?.minPrice) {
      where.OR = [
        { salePrice: { gte: parseFloat(filters.minPrice) } },
        { rentPrice: { gte: parseFloat(filters.minPrice) } },
      ]
    }
    if (filters?.maxPrice) {
      where.OR = [
        { salePrice: { lte: parseFloat(filters.maxPrice) } },
        { rentPrice: { lte: parseFloat(filters.maxPrice) } },
      ]
    }
    if (filters?.bedrooms) where.bedrooms = { gte: parseInt(filters.bedrooms) }

    return this.prisma.property.findMany({
      where,
      include: {
        owners: { include: { owner: true } },
        media: { orderBy: { order: 'asc' } },
        _count: { select: { contracts: true, interestedLeads: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, companyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, companyId },
      include: {
        owners: { include: { owner: true } },
        media: { orderBy: { order: 'asc' } },
        condominium: true,
        contracts: { take: 5, orderBy: { createdAt: 'desc' } },
        interestedLeads: {
          include: { lead: { select: { id: true, name: true, phone: true } } },
          take: 10,
        },
      },
    })

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado')
    }

    return property
  }

  async create(companyId: string, userId: string, dto: any) {
    // Generate property code
    const count = await this.prisma.property.count({ where: { companyId } })
    const code = `IMV${String(count + 1).padStart(4, '0')}`

    return this.prisma.property.create({
      data: {
        companyId,
        code,
        title: dto.title,
        type: dto.type,
        purpose: dto.purpose,
        status: dto.status || 'AVAILABLE',
        street: dto.street,
        number: dto.number,
        complement: dto.complement,
        neighborhood: dto.neighborhood,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        latitude: dto.latitude,
        longitude: dto.longitude,
        condominiumId: dto.condominiumId,
        totalArea: dto.totalArea,
        builtArea: dto.builtArea,
        privateArea: dto.privateArea,
        bedrooms: dto.bedrooms,
        suites: dto.suites,
        bathrooms: dto.bathrooms,
        parkingSpots: dto.parkingSpots,
        floor: dto.floor,
        features: dto.features || [],
        salePrice: dto.salePrice,
        rentPrice: dto.rentPrice,
        iptuYearly: dto.iptuYearly,
        condoMonthly: dto.condoMonthly,
        acceptsSwap: dto.acceptsSwap,
        registrationNumber: dto.registrationNumber,
        legalStatus: dto.legalStatus,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : null,
        description: dto.description,
        publishOnPortals: dto.publishOnPortals,
      },
    })
  }

  async update(id: string, companyId: string, dto: any) {
    const property = await this.prisma.property.findFirst({
      where: { id, companyId },
    })

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado')
    }

    return this.prisma.property.update({
      where: { id },
      data: {
        ...dto,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : undefined,
      },
    })
  }

  async delete(id: string, companyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, companyId },
    })

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado')
    }

    const contractCount = await this.prisma.contract.count({ where: { propertyId: id } })
    if (contractCount > 0) {
      throw new BadRequestException(`Este imóvel possui ${contractCount} contrato(s) vinculado(s) e não pode ser excluído. Encerre os contratos antes de excluir o imóvel.`)
    }
    await this.prisma.propertyMedia.deleteMany({ where: { propertyId: id } })
    return this.prisma.property.delete({ where: { id } })
  }

  async addMedia(id: string, companyId: string, mediaData: any) {
    const property = await this.prisma.property.findFirst({
      where: { id, companyId },
    })

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado')
    }

    const maxOrder = await this.prisma.propertyMedia.findFirst({
      where: { propertyId: id },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    return this.prisma.propertyMedia.create({
      data: {
        propertyId: id,
        type: mediaData.type,
        url: mediaData.url,
        thumbnailUrl: mediaData.thumbnailUrl,
        order: (maxOrder?.order || 0) + 1,
        isCover: mediaData.isCover || false,
      },
    })
  }

  async removeMedia(mediaId: string, companyId: string) {
    const media = await this.prisma.propertyMedia.findFirst({
      where: { id: mediaId },
      include: { property: true },
    })

    if (!media || media.property.companyId !== companyId) {
      throw new NotFoundException('Mídia não encontrada')
    }

    return this.prisma.propertyMedia.delete({ where: { id: mediaId } })
  }

  async setAiDescription(id: string, companyId: string, description: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, companyId },
    })

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado')
    }

    return this.prisma.property.update({
      where: { id },
      data: { aiDescription: description },
    })
  }

  // ViaCEP integration
  async getAddressByCep(cep: string) {
    const cleanCep = cep.replace(/\D/g, '')
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        throw new NotFoundException('CEP não encontrado')
      }

      return {
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        zipCode: cleanCep,
      }
    } catch (error) {
      throw new NotFoundException('CEP não encontrado')
    }
  }

  /** Listagem pública: imóveis com status AVAILABLE, sem autenticação */
  async findAllPublic(filters?: any) {
    const where: any = { status: 'AVAILABLE' }
    if (filters?.type) where.type = filters.type
    if (filters?.purpose) where.purpose = filters.purpose
    if (filters?.city) where.city = { contains: filters.city, mode: 'insensitive' }
    if (filters?.neighborhood) where.neighborhood = { contains: filters.neighborhood, mode: 'insensitive' }
    if (filters?.minPrice != null) {
      const min = parseFloat(filters.minPrice)
      where.AND = (where.AND || []).concat([
        { OR: [{ salePrice: { gte: min } }, { rentPrice: { gte: min } }] },
      ])
    }
    if (filters?.maxPrice != null) {
      const max = parseFloat(filters.maxPrice)
      where.AND = (where.AND || []).concat([
        { OR: [{ salePrice: { lte: max } }, { rentPrice: { lte: max } }] },
      ])
    }

    const list = await this.prisma.property.findMany({
      where,
      include: { media: true },
      orderBy: { createdAt: 'desc' },
    })

    return list.map((p) => this.toPublicProperty(p))
  }

  /** Detalhe público: um imóvel por ID, status AVAILABLE, sem autenticação */
  async findOnePublic(id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, status: 'AVAILABLE' },
      include: { media: true },
    })

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado')
    }

    const row = property as any
    return {
      ...this.toPublicProperty(row),
      street: row.street,
      number: row.number,
      zipCode: row.zipCode,
      features: row.features,
      latitude: row.latitude,
      longitude: row.longitude,
    }
  }

  private toPublicProperty(p: any) {
    return {
      id: p.id,
      code: p.code,
      title: `${p.type || 'Imóvel'} ${p.code}`,
      type: p.type,
      purpose: p.purpose,
      salePrice: p.salePrice,
      rentPrice: p.rentPrice,
      area: p.totalArea ?? p.builtArea ?? null,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      parkingSpaces: p.parkingSpots,
      city: p.city,
      neighborhood: p.neighborhood,
      state: p.state,
      description: p.description ?? p.aiDescription ?? null,
      media: (p.media || []).map((m: any) => ({ url: m.url, type: m.type, thumbnailUrl: m.thumbnailUrl })),
    }
  }

  async getStats(companyId: string) {
    const [total, available, rented, sold] = await Promise.all([
      this.prisma.property.count({ where: { companyId } }),
      this.prisma.property.count({ where: { companyId, status: 'AVAILABLE' } }),
      this.prisma.property.count({ where: { companyId, status: 'RENTED' } }),
      this.prisma.property.count({ where: { companyId, status: 'SOLD' } }),
    ])

    const totalValue = await this.prisma.property.aggregate({
      where: { companyId },
      _sum: { salePrice: true, rentPrice: true },
    })

    return {
      total,
      available,
      rented,
      sold,
      totalSaleValue: totalValue._sum.salePrice || 0,
      totalRentValue: totalValue._sum.rentPrice || 0,
    }
  }
}
