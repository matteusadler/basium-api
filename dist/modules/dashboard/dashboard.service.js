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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(companyId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const [totalLeads, activeLeads, leadsThisMonth, leadsLastMonth, wonLeads, wonLeadsThisMonth, lostLeads, totalTasks, pendingTasks, overdueTasks, totalProperties, activeContracts,] = await Promise.all([
            this.prisma.lead.count({ where: { companyId } }),
            this.prisma.lead.count({ where: { companyId, status: 'ACTIVE' } }),
            this.prisma.lead.count({
                where: { companyId, createdAt: { gte: startOfMonth } }
            }),
            this.prisma.lead.count({
                where: {
                    companyId,
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
                }
            }),
            this.prisma.lead.count({ where: { companyId, status: 'WON' } }),
            this.prisma.lead.count({
                where: { companyId, status: 'WON', closedAt: { gte: startOfMonth } }
            }),
            this.prisma.lead.count({ where: { companyId, status: 'LOST' } }),
            this.prisma.task.count({ where: { companyId } }),
            this.prisma.task.count({
                where: { companyId, status: { in: ['PENDING', 'IN_PROGRESS'] } }
            }),
            this.prisma.task.count({
                where: { companyId, status: 'OVERDUE' }
            }),
            this.prisma.property.count({ where: { companyId } }),
            this.prisma.contract.count({
                where: { companyId, status: { in: ['ACTIVE', 'PENDING'] } }
            }),
        ]);
        const wonLeadsWithValue = await this.prisma.lead.findMany({
            where: { companyId, status: 'WON' },
            select: { closedValue: true },
        });
        const totalRevenue = wonLeadsWithValue.reduce((sum, lead) => sum + (lead.closedValue || 0), 0);
        const wonLeadsThisMonthWithValue = await this.prisma.lead.findMany({
            where: {
                companyId,
                status: 'WON',
                closedAt: { gte: startOfMonth }
            },
            select: { closedValue: true },
        });
        const revenueThisMonth = wonLeadsThisMonthWithValue.reduce((sum, lead) => sum + (lead.closedValue || 0), 0);
        const conversionRate = totalLeads > 0
            ? Math.round((wonLeads / totalLeads) * 100 * 100) / 100
            : 0;
        const leadsGrowth = leadsLastMonth > 0
            ? Math.round(((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100 * 100) / 100
            : leadsThisMonth > 0 ? 100 : 0;
        return {
            leads: {
                total: totalLeads,
                active: activeLeads,
                won: wonLeads,
                lost: lostLeads,
                thisMonth: leadsThisMonth,
                growth: leadsGrowth,
            },
            tasks: {
                total: totalTasks,
                pending: pendingTasks,
                overdue: overdueTasks,
            },
            revenue: {
                total: totalRevenue,
                thisMonth: revenueThisMonth,
                wonThisMonth: wonLeadsThisMonth,
            },
            properties: {
                total: totalProperties,
            },
            contracts: {
                active: activeContracts,
            },
            conversionRate,
        };
    }
    async getLeadsChart(companyId, period = '6months') {
        const now = new Date();
        let startDate;
        let groupBy = 'month';
        switch (period) {
            case '7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                groupBy = 'day';
                break;
            case '30days':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                groupBy = 'day';
                break;
            case '3months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                groupBy = 'month';
                break;
            case '12months':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
                groupBy = 'month';
                break;
            case '6months':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
                groupBy = 'month';
                break;
        }
        const leads = await this.prisma.lead.findMany({
            where: {
                companyId,
                createdAt: { gte: startDate },
            },
            select: {
                createdAt: true,
                status: true,
            },
        });
        const chartData = {};
        leads.forEach(lead => {
            let key;
            const date = new Date(lead.createdAt);
            if (groupBy === 'day') {
                key = date.toISOString().split('T')[0];
            }
            else if (groupBy === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
            else {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
            }
            if (!chartData[key]) {
                chartData[key] = { novos: 0, ganhos: 0, perdidos: 0 };
            }
            chartData[key].novos++;
            if (lead.status === 'WON')
                chartData[key].ganhos++;
            if (lead.status === 'LOST')
                chartData[key].perdidos++;
        });
        const result = Object.entries(chartData)
            .map(([period, data]) => ({
            period,
            ...data,
        }))
            .sort((a, b) => a.period.localeCompare(b.period));
        return result;
    }
    async getPipelineStats(companyId) {
        const pipelines = await this.prisma.pipeline.findMany({
            where: { companyId, isActive: true },
            include: {
                stages: {
                    orderBy: { order: 'asc' },
                    include: {
                        _count: {
                            select: { leads: { where: { status: 'ACTIVE' } } },
                        },
                    },
                },
            },
        });
        return pipelines.map(pipeline => ({
            id: pipeline.id,
            name: pipeline.name,
            type: pipeline.type,
            stages: pipeline.stages.map(stage => ({
                id: stage.id,
                name: stage.name,
                color: stage.color,
                order: stage.order,
                leadsCount: stage._count.leads,
                probability: stage.probability,
            })),
        }));
    }
    async getRecentActivity(companyId, limit = 20) {
        const [recentLeads, recentTasks] = await Promise.all([
            this.prisma.lead.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    origin: true,
                    temperature: true,
                    createdAt: true,
                    stage: {
                        select: { name: true, color: true },
                    },
                },
            }),
            this.prisma.task.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                select: {
                    id: true,
                    title: true,
                    type: true,
                    status: true,
                    dueDate: true,
                    createdAt: true,
                    lead: {
                        select: { id: true, name: true },
                    },
                },
            }),
        ]);
        const activities = [
            ...recentLeads.map(lead => ({
                type: 'lead_created',
                id: lead.id,
                title: `Novo lead: ${lead.name}`,
                description: `Origem: ${lead.origin}`,
                temperature: lead.temperature,
                stage: lead.stage,
                createdAt: lead.createdAt,
            })),
            ...recentTasks.map(task => ({
                type: 'task_created',
                id: task.id,
                title: task.title,
                description: `Lead: ${task.lead.name}`,
                taskType: task.type,
                status: task.status,
                dueDate: task.dueDate,
                createdAt: task.createdAt,
            })),
        ]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
        return activities;
    }
    async getTodayTasks(companyId, userId) {
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
    async getLeadsByTemperature(companyId) {
        const [hot, warm, cold] = await Promise.all([
            this.prisma.lead.count({
                where: { companyId, temperature: 'HOT', status: 'ACTIVE' }
            }),
            this.prisma.lead.count({
                where: { companyId, temperature: 'WARM', status: 'ACTIVE' }
            }),
            this.prisma.lead.count({
                where: { companyId, temperature: 'COLD', status: 'ACTIVE' }
            }),
        ]);
        return { hot, warm, cold };
    }
    async getLeadsByOrigin(companyId) {
        const leads = await this.prisma.lead.groupBy({
            by: ['origin'],
            where: { companyId },
            _count: { id: true },
        });
        return leads.map(item => ({
            origin: item.origin,
            count: item._count.id,
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map