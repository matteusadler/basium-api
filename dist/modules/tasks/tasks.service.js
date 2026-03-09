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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(companyId, filters) {
        const where = { companyId };
        if (filters.userId)
            where.userId = filters.userId;
        if (filters.leadId)
            where.leadId = filters.leadId;
        if (filters.status)
            where.status = filters.status;
        if (filters.type)
            where.type = filters.type;
        if (filters.priority)
            where.priority = filters.priority;
        if (filters.tags && filters.tags.length > 0) {
            where.tags = { hasSome: filters.tags };
        }
        if (filters.dueDateFrom || filters.dueDateTo) {
            where.dueDate = {};
            if (filters.dueDateFrom)
                where.dueDate.gte = new Date(filters.dueDateFrom);
            if (filters.dueDateTo)
                where.dueDate.lte = new Date(filters.dueDateTo);
        }
        const orderBy = {};
        if (filters.sortBy) {
            orderBy[filters.sortBy] = filters.sortOrder || 'asc';
        }
        else {
            orderBy.dueDate = 'asc';
        }
        return this.prisma.task.findMany({
            where,
            include: {
                lead: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        stage: { select: { name: true, color: true } },
                    },
                },
            },
            orderBy,
        });
    }
    async findOne(id, companyId) {
        const task = await this.prisma.task.findFirst({
            where: { id, companyId },
            include: {
                lead: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                        pipeline: { select: { name: true } },
                        stage: { select: { name: true, color: true } },
                    },
                },
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Tarefa não encontrada');
        }
        return task;
    }
    async create(companyId, userId, dto) {
        if (dto.leadId) {
            const lead = await this.prisma.lead.findFirst({
                where: { id: dto.leadId, companyId },
            });
            if (!lead) {
                throw new common_1.NotFoundException('Lead não encontrado');
            }
        }
        return this.prisma.task.create({
            data: {
                companyId,
                leadId: dto.leadId,
                userId: dto.userId || userId,
                title: dto.title,
                description: dto.description,
                type: dto.type,
                priority: (dto.priority || 'MEDIUM'),
                dueDate: new Date(dto.dueDate),
                dueTime: dto.dueTime,
                tags: dto.tags || [],
            },
            include: {
                lead: {
                    select: { id: true, name: true, phone: true },
                },
            },
        });
    }
    async update(id, companyId, dto) {
        const task = await this.prisma.task.findFirst({
            where: { id, companyId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Tarefa não encontrada');
        }
        return this.prisma.task.update({
            where: { id },
            data: {
                ...dto,
                type: dto.type,
                priority: dto.priority,
                status: dto.status,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            },
        });
    }
    async complete(id, companyId, result) {
        const task = await this.prisma.task.findFirst({
            where: { id, companyId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Tarefa não encontrada');
        }
        return this.prisma.task.update({
            where: { id },
            data: {
                status: 'DONE',
                result,
            },
        });
    }
    async cancel(id, companyId) {
        const task = await this.prisma.task.findFirst({
            where: { id, companyId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Tarefa não encontrada');
        }
        return this.prisma.task.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
    }
    async delete(id, companyId) {
        const task = await this.prisma.task.findFirst({
            where: { id, companyId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Tarefa não encontrada');
        }
        return this.prisma.task.delete({ where: { id } });
    }
    async findToday(companyId, userId) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const where = {
            companyId,
            dueDate: {
                gte: startOfDay,
                lte: endOfDay,
            },
            status: { in: ['PENDING', 'IN_PROGRESS'] },
        };
        if (userId)
            where.userId = userId;
        return this.prisma.task.findMany({
            where,
            include: {
                lead: {
                    select: { id: true, name: true, phone: true },
                },
            },
            orderBy: [{ priority: 'desc' }, { dueTime: 'asc' }],
        });
    }
    async findOverdue(companyId, userId) {
        const now = new Date();
        const where = {
            companyId,
            dueDate: { lt: now },
            status: { in: ['PENDING', 'IN_PROGRESS'] },
        };
        if (userId)
            where.userId = userId;
        await this.prisma.task.updateMany({
            where,
            data: { status: 'OVERDUE' },
        });
        return this.prisma.task.findMany({
            where: { ...where, status: 'OVERDUE' },
            include: {
                lead: {
                    select: { id: true, name: true, phone: true },
                },
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async findUpcoming(companyId, userId, days = 7) {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        const where = {
            companyId,
            dueDate: {
                gte: now,
                lte: futureDate,
            },
            status: { in: ['PENDING', 'IN_PROGRESS'] },
        };
        if (userId)
            where.userId = userId;
        return this.prisma.task.findMany({
            where,
            include: {
                lead: {
                    select: { id: true, name: true, phone: true },
                },
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async getCalendarView(companyId, userId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        const where = {
            companyId,
            dueDate: {
                gte: startDate,
                lte: endDate,
            },
        };
        if (userId)
            where.userId = userId;
        const tasks = await this.prisma.task.findMany({
            where,
            include: {
                lead: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { dueDate: 'asc' },
        });
        const calendar = {};
        tasks.forEach(task => {
            const day = task.dueDate.toISOString().split('T')[0];
            if (!calendar[day])
                calendar[day] = [];
            calendar[day].push(task);
        });
        return calendar;
    }
    async getStats(companyId, userId) {
        const where = { companyId };
        if (userId)
            where.userId = userId;
        const now = new Date();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const [total, pending, done, overdue, todayCount] = await Promise.all([
            this.prisma.task.count({ where }),
            this.prisma.task.count({ where: { ...where, status: 'PENDING' } }),
            this.prisma.task.count({ where: { ...where, status: 'DONE' } }),
            this.prisma.task.count({
                where: {
                    ...where,
                    status: { in: ['PENDING', 'IN_PROGRESS'] },
                    dueDate: { lt: now },
                },
            }),
            this.prisma.task.count({
                where: {
                    ...where,
                    dueDate: { gte: startOfDay, lte: endOfDay },
                },
            }),
        ]);
        const completionRate = total > 0 ? (done / total) * 100 : 0;
        return {
            total,
            pending,
            done,
            overdue,
            todayCount,
            completionRate: Math.round(completionRate * 100) / 100,
        };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map