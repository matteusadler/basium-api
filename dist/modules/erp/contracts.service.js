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
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ContractsService = class ContractsService {
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async findAll(companyId, filters) {
        const where = { companyId };
        if (filters?.type)
            where.type = filters.type;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.propertyId)
            where.propertyId = filters.propertyId;
        if (filters?.leadId)
            where.leadId = filters.leadId;
        return this.prisma.contract.findMany({
            where,
            include: {
                property: { select: { id: true, code: true, street: true, number: true, city: true } },
                lead: { select: { id: true, name: true, phone: true, email: true } },
                _count: { select: { financialEntries: true, commissions: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, companyId) {
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
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contrato não encontrado');
        }
        return contract;
    }
    async create(companyId, userId, dto) {
        const property = await this.prisma.property.findFirst({
            where: { id: dto.propertyId, companyId },
        });
        if (!property) {
            throw new common_1.NotFoundException('Imóvel não encontrado');
        }
        const lead = await this.prisma.lead.findFirst({
            where: { id: dto.leadId, companyId },
        });
        if (!lead) {
            throw new common_1.NotFoundException('Lead não encontrado');
        }
        if (dto.type === 'RENTAL') {
            const existingContract = await this.prisma.contract.findFirst({
                where: {
                    propertyId: dto.propertyId,
                    status: 'ACTIVE',
                    type: 'RENTAL',
                },
            });
            if (existingContract) {
                throw new common_1.BadRequestException('Imóvel já possui contrato de locação ativo');
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
                salePrice: dto.salePrice,
                paymentType: dto.paymentType,
                bankName: dto.bankName,
                financedAmount: dto.financedAmount,
                interestRate: dto.interestRate,
                termMonths: dto.termMonths,
                signedAt: dto.signedAt ? new Date(dto.signedAt) : null,
                deedAt: dto.deedAt ? new Date(dto.deedAt) : null,
                keysDeliveredAt: dto.keysDeliveredAt ? new Date(dto.keysDeliveredAt) : null,
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
        });
        if (dto.type === 'SALE' && dto.status === 'ACTIVE') {
            await this.prisma.property.update({
                where: { id: dto.propertyId },
                data: { status: 'SOLD' },
            });
        }
        else if (dto.type === 'RENTAL' && dto.status === 'ACTIVE') {
            await this.prisma.property.update({
                where: { id: dto.propertyId },
                data: { status: 'RENTED' },
            });
        }
        if (dto.status === 'ACTIVE') {
            await this.prisma.lead.update({
                where: { id: dto.leadId },
                data: {
                    status: 'WON',
                    closedValue: dto.type === 'SALE' ? dto.salePrice : dto.rentAmount * (dto.durationMonths || 12),
                    closedAt: new Date(),
                },
            });
        }
        return contract;
    }
    async update(id, companyId, dto) {
        const contract = await this.prisma.contract.findFirst({
            where: { id, companyId },
            include: { lead: { select: { name: true } } },
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contrato não encontrado');
        }
        const newStatus = dto.status;
        const wasSignedOrActive = contract.status === 'SIGNED' || contract.status === 'ACTIVE';
        const becomesSignedOrActive = newStatus === 'SIGNED' || newStatus === 'ACTIVE';
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
        });
        if (!wasSignedOrActive && becomesSignedOrActive && contract.brokerId) {
            const leadName = contract.lead?.name || 'Contrato';
            this.notifications
                .createNotification(contract.brokerId, companyId, 'CONTRACT_SIGNED', 'Contrato assinado', `Contrato de ${leadName} foi assinado`, { contractId: id })
                .catch(() => { });
        }
        return updated;
    }
    async delete(id, companyId) {
        const contract = await this.prisma.contract.findFirst({
            where: { id, companyId },
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contrato não encontrado');
        }
        if (contract.status === 'ACTIVE') {
            throw new common_1.BadRequestException('Não é possível excluir contrato ativo');
        }
        return this.prisma.contract.delete({ where: { id } });
    }
    async addDocument(id, companyId, docData) {
        const contract = await this.prisma.contract.findFirst({
            where: { id, companyId },
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contrato não encontrado');
        }
        return this.prisma.contractDocument.create({
            data: {
                contractId: id,
                name: docData.name,
                url: docData.url,
                type: docData.type,
            },
        });
    }
    async generateRentalEntries(id, companyId) {
        const contract = await this.prisma.contract.findFirst({
            where: { id, companyId, type: 'RENTAL' },
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contrato de locação não encontrado');
        }
        if (!contract.startDate || !contract.durationMonths || !contract.rentAmount) {
            throw new common_1.BadRequestException('Contrato não possui dados suficientes para gerar parcelas');
        }
        const entries = [];
        const startDate = new Date(contract.startDate);
        for (let i = 0; i < contract.durationMonths; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            if (contract.dueDayOfMonth) {
                dueDate.setDate(contract.dueDayOfMonth);
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
            });
        }
        await this.prisma.financialEntry.createMany({ data: entries });
        return { created: entries.length };
    }
    async getStats(companyId) {
        const [total, active, pending, completed] = await Promise.all([
            this.prisma.contract.count({ where: { companyId } }),
            this.prisma.contract.count({ where: { companyId, status: 'ACTIVE' } }),
            this.prisma.contract.count({ where: { companyId, status: 'PENDING' } }),
            this.prisma.contract.count({ where: { companyId, status: 'COMPLETED' } }),
        ]);
        const totalValue = await this.prisma.contract.aggregate({
            where: { companyId, status: 'ACTIVE' },
            _sum: { salePrice: true, rentAmount: true },
        });
        return {
            total,
            active,
            pending,
            completed,
            totalSaleValue: totalValue._sum.salePrice || 0,
            totalRentValue: totalValue._sum.rentAmount || 0,
        };
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map