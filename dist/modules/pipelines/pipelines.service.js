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
exports.PipelinesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let PipelinesService = class PipelinesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(companyId) {
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
        });
    }
    async findOne(id, companyId) {
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
        });
        if (!pipeline) {
            throw new common_1.NotFoundException('Pipeline não encontrado');
        }
        return pipeline;
    }
    async create(companyId, dto) {
        if (dto.isDefault) {
            await this.prisma.pipeline.updateMany({
                where: { companyId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const defaultStages = [
            { name: 'Novo Lead', color: '#6366f1', order: 1, probability: 10, type: 'INITIAL' },
            { name: 'Contato Feito', color: '#8b5cf6', order: 2, probability: 25, type: 'INTERMEDIATE' },
            { name: 'Qualificado', color: '#a855f7', order: 3, probability: 50, type: 'INTERMEDIATE' },
            { name: 'Proposta', color: '#c084fc', order: 4, probability: 75, type: 'INTERMEDIATE' },
            { name: 'Ganho', color: '#10b981', order: 5, probability: 100, type: 'WON' },
            { name: 'Perdido', color: '#ef4444', order: 6, probability: 0, type: 'LOST' },
        ];
        const stagesToCreate = dto.stages
            ? dto.stages.map((s, index) => ({
                name: s.name,
                color: s.color || '#6366f1',
                order: s.order || index + 1,
                probability: s.probability || 50,
                type: s.type || 'INTERMEDIATE',
            }))
            : defaultStages;
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
        });
    }
    async update(id, companyId, dto) {
        const pipeline = await this.prisma.pipeline.findFirst({
            where: { id, companyId },
        });
        if (!pipeline) {
            throw new common_1.NotFoundException('Pipeline não encontrado');
        }
        if (dto.isDefault) {
            await this.prisma.pipeline.updateMany({
                where: { companyId, isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }
        return this.prisma.pipeline.update({
            where: { id },
            data: dto,
            include: {
                stages: {
                    orderBy: { order: 'asc' },
                },
            },
        });
    }
    async delete(id, companyId) {
        const pipeline = await this.prisma.pipeline.findFirst({
            where: { id, companyId },
            include: { _count: { select: { leads: true } } },
        });
        if (!pipeline) {
            throw new common_1.NotFoundException('Pipeline não encontrado');
        }
        if (pipeline._count.leads > 0) {
            throw new common_1.BadRequestException('Não é possível excluir pipeline com leads vinculados');
        }
        return this.prisma.pipeline.delete({
            where: { id },
        });
    }
    async getDefault(companyId) {
        const pipeline = await this.prisma.pipeline.findFirst({
            where: { companyId, isDefault: true },
            include: {
                stages: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!pipeline) {
            return this.prisma.pipeline.findFirst({
                where: { companyId },
                include: {
                    stages: {
                        orderBy: { order: 'asc' },
                    },
                },
            });
        }
        return pipeline;
    }
    async createStage(pipelineId, companyId, dto) {
        const pipeline = await this.prisma.pipeline.findFirst({
            where: { id: pipelineId, companyId },
            include: { stages: { orderBy: { order: 'desc' }, take: 1 } },
        });
        if (!pipeline) {
            throw new common_1.NotFoundException('Pipeline não encontrado');
        }
        const maxOrder = pipeline.stages[0]?.order || 0;
        return this.prisma.stage.create({
            data: {
                pipelineId,
                name: dto.name,
                color: dto.color || '#6366f1',
                order: dto.order || maxOrder + 1,
                probability: dto.probability || 50,
                type: dto.type || 'INTERMEDIATE',
            },
        });
    }
    async updateStage(stageId, companyId, dto) {
        const stage = await this.prisma.stage.findFirst({
            where: { id: stageId },
            include: { pipeline: true },
        });
        if (!stage || stage.pipeline.companyId !== companyId) {
            throw new common_1.NotFoundException('Etapa não encontrada');
        }
        return this.prisma.stage.update({
            where: { id: stageId },
            data: dto,
        });
    }
    async deleteStage(stageId, companyId) {
        const stage = await this.prisma.stage.findFirst({
            where: { id: stageId },
            include: {
                pipeline: true,
                _count: { select: { leads: true } },
            },
        });
        if (!stage || stage.pipeline.companyId !== companyId) {
            throw new common_1.NotFoundException('Etapa não encontrada');
        }
        if (stage._count.leads > 0) {
            throw new common_1.BadRequestException('Não é possível excluir etapa com leads vinculados');
        }
        return this.prisma.stage.delete({
            where: { id: stageId },
        });
    }
    async reorderStages(pipelineId, companyId, stageIds) {
        const pipeline = await this.prisma.pipeline.findFirst({
            where: { id: pipelineId, companyId },
        });
        if (!pipeline) {
            throw new common_1.NotFoundException('Pipeline não encontrado');
        }
        const updates = stageIds.map((stageId, index) => this.prisma.stage.update({
            where: { id: stageId },
            data: { order: index + 1 },
        }));
        await this.prisma.$transaction(updates);
        return this.findOne(pipelineId, companyId);
    }
    async getKanbanStats(pipelineId, companyId) {
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
        });
        if (!pipeline) {
            throw new common_1.NotFoundException('Pipeline não encontrado');
        }
        return pipeline.stages.map(stage => {
            const totalValue = stage.leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);
            const weightedValue = stage.leads.reduce((sum, lead) => sum + ((lead.estimatedValue || 0) * (lead.probability || stage.probability) / 100), 0);
            return {
                stageId: stage.id,
                stageName: stage.name,
                stageColor: stage.color,
                leadCount: stage.leads.length,
                totalValue,
                weightedValue,
            };
        });
    }
};
exports.PipelinesService = PipelinesService;
exports.PipelinesService = PipelinesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PipelinesService);
//# sourceMappingURL=pipelines.service.js.map