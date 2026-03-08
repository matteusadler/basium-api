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
exports.OwnersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let OwnersService = class OwnersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(companyId) {
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
        });
    }
    async findOne(id, companyId) {
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
        });
        if (!owner) {
            throw new common_1.NotFoundException('Proprietário não encontrado');
        }
        return owner;
    }
    async create(companyId, dto) {
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
        });
    }
    async update(id, companyId, dto) {
        const owner = await this.prisma.owner.findFirst({
            where: { id, companyId },
        });
        if (!owner) {
            throw new common_1.NotFoundException('Proprietário não encontrado');
        }
        return this.prisma.owner.update({
            where: { id },
            data: dto,
        });
    }
    async delete(id, companyId) {
        const owner = await this.prisma.owner.findFirst({
            where: { id, companyId },
        });
        if (!owner) {
            throw new common_1.NotFoundException('Proprietário não encontrado');
        }
        const hasActiveContracts = await this.prisma.propertyOwner.findFirst({
            where: {
                ownerId: id,
                property: {
                    contracts: { some: { status: 'ACTIVE' } },
                },
            },
        });
        if (hasActiveContracts) {
            throw new Error('Proprietário possui contratos ativos e não pode ser removido');
        }
        return this.prisma.owner.delete({ where: { id } });
    }
    async linkToProperty(ownerId, propertyId, companyId, ownershipPct = 100) {
        const owner = await this.prisma.owner.findFirst({
            where: { id: ownerId, companyId },
        });
        if (!owner) {
            throw new common_1.NotFoundException('Proprietário não encontrado');
        }
        const property = await this.prisma.property.findFirst({
            where: { id: propertyId, companyId },
        });
        if (!property) {
            throw new common_1.NotFoundException('Imóvel não encontrado');
        }
        return this.prisma.propertyOwner.create({
            data: {
                ownerId,
                propertyId,
                ownershipPct,
            },
        });
    }
    async unlinkFromProperty(ownerId, propertyId, companyId) {
        const link = await this.prisma.propertyOwner.findFirst({
            where: {
                ownerId,
                propertyId,
                property: { companyId },
            },
        });
        if (!link) {
            throw new common_1.NotFoundException('Vínculo não encontrado');
        }
        return this.prisma.propertyOwner.delete({
            where: { id: link.id },
        });
    }
};
exports.OwnersService = OwnersService;
exports.OwnersService = OwnersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OwnersService);
//# sourceMappingURL=owners.service.js.map