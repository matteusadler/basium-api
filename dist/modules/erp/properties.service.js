"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let PropertiesService = class PropertiesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(companyId, filters) {
        const where = { companyId };
        if (filters?.type)
            where.type = filters.type;
        if (filters?.purpose)
            where.purpose = filters.purpose;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.city)
            where.city = filters.city;
        if (filters?.neighborhood)
            where.neighborhood = filters.neighborhood;
        if (filters?.minPrice) {
            where.OR = [
                { salePrice: { gte: parseFloat(filters.minPrice) } },
                { rentPrice: { gte: parseFloat(filters.minPrice) } },
            ];
        }
        if (filters?.maxPrice) {
            where.OR = [
                { salePrice: { lte: parseFloat(filters.maxPrice) } },
                { rentPrice: { lte: parseFloat(filters.maxPrice) } },
            ];
        }
        if (filters?.bedrooms)
            where.bedrooms = { gte: parseInt(filters.bedrooms) };
        return this.prisma.property.findMany({
            where,
            include: {
                owners: { include: { owner: true } },
                media: { orderBy: { order: 'asc' } },
                _count: { select: { contracts: true, interestedLeads: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, companyId) {
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
        });
        if (!property) {
            throw new common_1.NotFoundException('Imóvel não encontrado');
        }
        return property;
    }
    async create(companyId, userId, dto) {
        const count = await this.prisma.property.count({ where: { companyId } });
        const code = `IMV${String(count + 1).padStart(4, '0')}`;
        return this.prisma.property.create({
            data: {
                companyId,
                code,
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
        });
    }
    async update(id, companyId, dto) {
        const property = await this.prisma.property.findFirst({
            where: { id, companyId },
        });
        if (!property) {
            throw new common_1.NotFoundException('Imóvel não encontrado');
        }
        return this.prisma.property.update({
            where: { id },
            data: {
                ...dto,
                availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : undefined,
            },
        });
    }
    async delete(id, companyId) {
        const property = await this.prisma.property.findFirst({
            where: { id, companyId },
        });
        if (!property) {
            throw new common_1.NotFoundException('Imóvel não encontrado');
        }
        return this.prisma.property.delete({ where: { id } });
    }
    async addMedia(id, companyId, mediaData) {
        const property = await this.prisma.property.findFirst({
            where: { id, companyId },
        });
        if (!property) {
            throw new common_1.NotFoundException('Imóvel não encontrado');
        }
        const maxOrder = await this.prisma.propertyMedia.findFirst({
            where: { propertyId: id },
            orderBy: { order: 'desc' },
            select: { order: true },
        });
        return this.prisma.propertyMedia.create({
            data: {
                propertyId: id,
                type: mediaData.type,
                url: mediaData.url,
                thumbnailUrl: mediaData.thumbnailUrl,
                order: (maxOrder?.order || 0) + 1,
                isCover: mediaData.isCover || false,
            },
        });
    }
    async removeMedia(mediaId, companyId) {
        const media = await this.prisma.propertyMedia.findFirst({
            where: { id: mediaId },
            include: { property: true },
        });
        if (!media || media.property.companyId !== companyId) {
            throw new common_1.NotFoundException('Mídia não encontrada');
        }
        return this.prisma.propertyMedia.delete({ where: { id: mediaId } });
    }
    async setAiDescription(id, companyId, description) {
        const property = await this.prisma.property.findFirst({
            where: { id, companyId },
        });
        if (!property) {
            throw new common_1.NotFoundException('Imóvel não encontrado');
        }
        return this.prisma.property.update({
            where: { id },
            data: { aiDescription: description },
        });
    }
    async getAddressByCep(cep) {
        const cleanCep = cep.replace(/\D/g, '');
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();
            if (data.erro) {
                throw new common_1.NotFoundException('CEP não encontrado');
            }
            return {
                street: data.logradouro,
                neighborhood: data.bairro,
                city: data.localidade,
                state: data.uf,
                zipCode: cleanCep,
            };
        }
        catch (error) {
            throw new common_1.NotFoundException('CEP não encontrado');
        }
    }
    async findAllPublic(filters) {
        const where = { status: 'AVAILABLE' };
        if (filters?.type)
            where.type = filters.type;
        if (filters?.purpose)
            where.purpose = filters.purpose;
        if (filters?.city)
            where.city = { contains: filters.city, mode: 'insensitive' };
        if (filters?.neighborhood)
            where.neighborhood = { contains: filters.neighborhood, mode: 'insensitive' };
        if (filters?.minPrice != null) {
            const min = parseFloat(filters.minPrice);
            where.AND = (where.AND || []).concat([
                { OR: [{ salePrice: { gte: min } }, { rentPrice: { gte: min } }] },
            ]);
        }
        if (filters?.maxPrice != null) {
            const max = parseFloat(filters.maxPrice);
            where.AND = (where.AND || []).concat([
                { OR: [{ salePrice: { lte: max } }, { rentPrice: { lte: max } }] },
            ]);
        }
        const list = await this.prisma.property.findMany({
            where,
            include: { media: true },
            orderBy: { createdAt: 'desc' },
        });
        return list.map((p) => this.toPublicProperty(p));
    }
    async findOnePublic(id) {
        const property = await this.prisma.property.findFirst({
            where: { id, status: 'AVAILABLE' },
            include: { media: true },
        });
        if (!property) {
            throw new common_1.NotFoundException('Imóvel não encontrado');
        }
        const row = property;
        return {
            ...this.toPublicProperty(row),
            street: row.street,
            number: row.number,
            zipCode: row.zipCode,
            features: row.features,
            latitude: row.latitude,
            longitude: row.longitude,
        };
    }
    toPublicProperty(p) {
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
            media: (p.media || []).map((m) => ({ url: m.url, type: m.type, thumbnailUrl: m.thumbnailUrl })),
        };
    }
    async getStats(companyId) {
        const [total, available, rented, sold] = await Promise.all([
            this.prisma.property.count({ where: { companyId } }),
            this.prisma.property.count({ where: { companyId, status: 'AVAILABLE' } }),
            this.prisma.property.count({ where: { companyId, status: 'RENTED' } }),
            this.prisma.property.count({ where: { companyId, status: 'SOLD' } }),
        ]);
        const totalValue = await this.prisma.property.aggregate({
            where: { companyId },
            _sum: { salePrice: true, rentPrice: true },
        });
        return {
            total,
            available,
            rented,
            sold,
            totalSaleValue: totalValue._sum.salePrice || 0,
            totalRentValue: totalValue._sum.rentPrice || 0,
        };
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map