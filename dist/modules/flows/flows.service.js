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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FlowsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const create_flow_dto_1 = require("./dto/create-flow.dto");
let FlowsService = FlowsService_1 = class FlowsService {
    constructor(prisma, flowEngineQueue, flowMessageQueue, flowWaitQueue) {
        this.prisma = prisma;
        this.flowEngineQueue = flowEngineQueue;
        this.flowMessageQueue = flowMessageQueue;
        this.flowWaitQueue = flowWaitQueue;
        this.logger = new common_1.Logger(FlowsService_1.name);
    }
    async findAll(companyId) {
        return this.prisma.flow.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { executions: true }
                }
            }
        });
    }
    async findOne(id, companyId) {
        const flow = await this.prisma.flow.findFirst({
            where: { id, companyId },
            include: {
                executions: {
                    orderBy: { startedAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        status: true,
                        startedAt: true,
                        completedAt: true,
                        lead: {
                            select: { id: true, name: true, phone: true }
                        }
                    }
                }
            }
        });
        if (!flow) {
            throw new common_1.NotFoundException('Fluxo não encontrado');
        }
        return flow;
    }
    async create(companyId, userId, dto) {
        const triggerNodes = dto.nodes.filter(n => n.type === create_flow_dto_1.NodeType.TRIGGER || n.type === create_flow_dto_1.NodeType.TRIGGER_LEAD_STAGE || n.type === 'trigger_lead_stage');
        const triggerTypes = triggerNodes
            .map(n => n.data?.triggerType || (n.type === 'trigger_lead_stage' ? 'LEAD_STAGE_CHANGED' : null))
            .filter(Boolean);
        const keywords = triggerNodes
            .filter(n => n.data?.triggerType === create_flow_dto_1.TriggerType.KEYWORD)
            .flatMap(n => n.data?.keywords || []);
        const flow = await this.prisma.flow.create({
            data: {
                companyId,
                createdBy: userId,
                name: dto.name,
                description: dto.description,
                nodes: dto.nodes,
                edges: dto.edges,
                triggerTypes,
                keywords,
                status: 'DRAFT',
            },
        });
        this.logger.log(`Flow created: ${flow.id} - ${flow.name}`);
        return flow;
    }
    async update(id, companyId, dto) {
        const flow = await this.prisma.flow.findFirst({
            where: { id, companyId }
        });
        if (!flow) {
            throw new common_1.NotFoundException('Fluxo não encontrado');
        }
        let updateData = { ...dto };
        if (dto.nodes) {
            const triggerNodes = dto.nodes.filter(n => n.type === create_flow_dto_1.NodeType.TRIGGER);
            updateData.triggerTypes = triggerNodes.map(n => n.data.triggerType).filter(Boolean);
            updateData.keywords = triggerNodes
                .filter(n => n.data.triggerType === create_flow_dto_1.TriggerType.KEYWORD)
                .flatMap(n => n.data.keywords || []);
        }
        return this.prisma.flow.update({
            where: { id },
            data: {
                ...updateData,
                version: { increment: 1 }
            },
        });
    }
    async delete(id, companyId) {
        const flow = await this.prisma.flow.findFirst({
            where: { id, companyId }
        });
        if (!flow) {
            throw new common_1.NotFoundException('Fluxo não encontrado');
        }
        await this.prisma.flowExecution.updateMany({
            where: { flowId: id, status: 'RUNNING' },
            data: { status: 'CANCELLED' }
        });
        return this.prisma.flow.delete({ where: { id } });
    }
    async publish(id, companyId) {
        const flow = await this.prisma.flow.findFirst({
            where: { id, companyId }
        });
        if (!flow) {
            throw new common_1.NotFoundException('Fluxo não encontrado');
        }
        this.validateFlow(flow.nodes, flow.edges);
        const updated = await this.prisma.flow.update({
            where: { id },
            data: { status: 'ACTIVE' },
        });
        await this.prisma.companyUsage.update({
            where: { companyId },
            data: { activeFlows: { increment: 1 } }
        }).catch(() => { });
        this.logger.log(`Flow published: ${id}`);
        return updated;
    }
    async pause(id, companyId) {
        const flow = await this.prisma.flow.findFirst({
            where: { id, companyId, status: 'ACTIVE' }
        });
        if (!flow) {
            throw new common_1.NotFoundException('Fluxo ativo não encontrado');
        }
        return this.prisma.flow.update({
            where: { id },
            data: { status: 'PAUSED' },
        });
    }
    async resume(id, companyId) {
        const flow = await this.prisma.flow.findFirst({
            where: { id, companyId, status: 'PAUSED' }
        });
        if (!flow) {
            throw new common_1.NotFoundException('Fluxo pausado não encontrado');
        }
        return this.prisma.flow.update({
            where: { id },
            data: { status: 'ACTIVE' },
        });
    }
    async archive(id, companyId) {
        const flow = await this.prisma.flow.findFirst({
            where: { id, companyId }
        });
        if (!flow) {
            throw new common_1.NotFoundException('Fluxo não encontrado');
        }
        await this.prisma.flowExecution.updateMany({
            where: { flowId: id, status: { in: ['RUNNING', 'WAITING'] } },
            data: { status: 'CANCELLED' }
        });
        return this.prisma.flow.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });
    }
    async toggle(id, companyId) {
        const flow = await this.prisma.flow.findFirst({
            where: { id, companyId },
        });
        if (!flow) {
            throw new common_1.NotFoundException('Fluxo não encontrado');
        }
        const newStatus = flow.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        return this.prisma.flow.update({
            where: { id },
            data: { status: newStatus },
        });
    }
    async startExecution(flowId, companyId, dto) {
        const flow = await this.prisma.flow.findFirst({
            where: { id: flowId, companyId, status: 'ACTIVE' }
        });
        if (!flow) {
            throw new common_1.NotFoundException('Fluxo ativo não encontrado');
        }
        const existingExec = await this.prisma.flowExecution.findFirst({
            where: {
                flowId,
                leadId: dto.leadId,
                status: { in: ['RUNNING', 'WAITING'] }
            }
        });
        if (existingExec) {
            throw new common_1.BadRequestException('Lead já está em execução neste fluxo');
        }
        const nodes = flow.nodes;
        let startNode = nodes.find(n => n.id === dto.startNodeId);
        if (!startNode) {
            startNode = nodes.find(n => n.type === create_flow_dto_1.NodeType.TRIGGER);
        }
        if (!startNode) {
            throw new common_1.BadRequestException('Fluxo não possui nó de início');
        }
        const execution = await this.prisma.flowExecution.create({
            data: {
                flowId,
                companyId,
                leadId: dto.leadId,
                contactPhone: dto.contactPhone,
                status: 'RUNNING',
                currentNodeId: startNode.id,
                variables: dto.variables || {},
            },
        });
        await this.prisma.companyUsage.update({
            where: { companyId },
            data: { flowExecMonth: { increment: 1 } }
        }).catch(() => { });
        await this.flowEngineQueue.add('process-node', {
            executionId: execution.id,
            nodeId: startNode.id,
        });
        this.logger.log(`Flow execution started: ${execution.id}`);
        return execution;
    }
    async stopExecution(executionId, companyId) {
        const execution = await this.prisma.flowExecution.findFirst({
            where: { id: executionId, companyId, status: { in: ['RUNNING', 'WAITING'] } }
        });
        if (!execution) {
            throw new common_1.NotFoundException('Execução não encontrada ou já finalizada');
        }
        return this.prisma.flowExecution.update({
            where: { id: executionId },
            data: {
                status: 'CANCELLED',
                completedAt: new Date()
            },
        });
    }
    async getExecution(executionId, companyId) {
        const execution = await this.prisma.flowExecution.findFirst({
            where: { id: executionId, companyId },
            include: {
                flow: { select: { id: true, name: true } },
                lead: { select: { id: true, name: true, phone: true } },
                steps: {
                    orderBy: { executedAt: 'asc' }
                }
            }
        });
        if (!execution) {
            throw new common_1.NotFoundException('Execução não encontrada');
        }
        return execution;
    }
    async getExecutions(flowId, companyId, limit = 50) {
        return this.prisma.flowExecution.findMany({
            where: { flowId, companyId },
            orderBy: { startedAt: 'desc' },
            take: limit,
            include: {
                lead: { select: { id: true, name: true, phone: true } }
            }
        });
    }
    async triggerByKeyword(companyId, leadId, phone, message) {
        const messageLower = message.toLowerCase().trim();
        const flows = await this.prisma.flow.findMany({
            where: {
                companyId,
                status: 'ACTIVE',
                triggerTypes: { has: 'KEYWORD' }
            }
        });
        for (const flow of flows) {
            const keywords = flow.keywords || [];
            const matched = keywords.some(kw => messageLower.includes(kw.toLowerCase()));
            if (matched) {
                const existingExec = await this.prisma.flowExecution.findFirst({
                    where: {
                        flowId: flow.id,
                        leadId,
                        status: { in: ['RUNNING', 'WAITING'] }
                    }
                });
                if (!existingExec) {
                    this.logger.log(`Keyword trigger matched: "${message}" -> Flow ${flow.name}`);
                    await this.startExecution(flow.id, companyId, {
                        leadId,
                        contactPhone: phone,
                        variables: { triggerMessage: message }
                    });
                }
            }
        }
    }
    async triggerByFirstMessage(companyId, leadId, phone) {
        const flows = await this.prisma.flow.findMany({
            where: {
                companyId,
                status: 'ACTIVE',
                triggerTypes: { has: 'FIRST_MESSAGE' }
            }
        });
        for (const flow of flows) {
            const existingExec = await this.prisma.flowExecution.findFirst({
                where: {
                    flowId: flow.id,
                    leadId,
                }
            });
            if (!existingExec) {
                this.logger.log(`First message trigger: Lead ${leadId} -> Flow ${flow.name}`);
                await this.startExecution(flow.id, companyId, {
                    leadId,
                    contactPhone: phone,
                });
            }
        }
    }
    async getFlowAnalytics(flowId, companyId) {
        const flow = await this.prisma.flow.findFirst({
            where: { id: flowId, companyId }
        });
        if (!flow) {
            throw new common_1.NotFoundException('Fluxo não encontrado');
        }
        const nodes = flow.nodes;
        const [totalExecutions, completedExecutions, runningExecutions] = await Promise.all([
            this.prisma.flowExecution.count({ where: { flowId } }),
            this.prisma.flowExecution.count({ where: { flowId, status: 'COMPLETED' } }),
            this.prisma.flowExecution.count({ where: { flowId, status: { in: ['RUNNING', 'WAITING'] } } }),
        ]);
        const nodeAnalytics = await Promise.all(nodes.map(async (node) => {
            const [executed, completed, failed] = await Promise.all([
                this.prisma.flowStep.count({ where: { execution: { flowId }, nodeId: node.id } }),
                this.prisma.flowStep.count({ where: { execution: { flowId }, nodeId: node.id, status: 'COMPLETED' } }),
                this.prisma.flowStep.count({ where: { execution: { flowId }, nodeId: node.id, status: 'FAILED' } }),
            ]);
            return {
                nodeId: node.id,
                nodeType: node.type,
                label: node.data?.label || node.type,
                executed,
                completed,
                failed,
                successRate: executed > 0 ? Math.round((completed / executed) * 100) : 0
            };
        }));
        const conversionRate = totalExecutions > 0
            ? Math.round((completedExecutions / totalExecutions) * 100)
            : 0;
        return {
            flowId,
            flowName: flow.name,
            totalExecutions,
            completedExecutions,
            runningExecutions,
            conversionRate,
            nodeAnalytics,
        };
    }
    async getTemplates() {
        return this.prisma.flowTemplate.findMany({
            where: { isPublic: true },
            orderBy: [{ usageCount: 'desc' }, { name: 'asc' }]
        });
    }
    async createFromTemplate(templateId, companyId, userId, name) {
        const template = await this.prisma.flowTemplate.findUnique({
            where: { id: templateId }
        });
        if (!template) {
            throw new common_1.NotFoundException('Template não encontrado');
        }
        await this.prisma.flowTemplate.update({
            where: { id: templateId },
            data: { usageCount: { increment: 1 } }
        });
        return this.create(companyId, userId, {
            name: name || `${template.name} (cópia)`,
            description: template.description,
            nodes: template.nodes,
            edges: template.edges,
        });
    }
    validateFlow(nodes, edges) {
        if (!nodes || nodes.length === 0) {
            throw new common_1.BadRequestException('Fluxo deve ter pelo menos um nó');
        }
        const hasTrigger = nodes.some(n => n.type === create_flow_dto_1.NodeType.TRIGGER);
        if (!hasTrigger) {
            throw new common_1.BadRequestException('Fluxo deve ter pelo menos um gatilho (TRIGGER)');
        }
        for (const node of nodes) {
            if (!node.id || !node.type) {
                throw new common_1.BadRequestException('Todos os nós devem ter id e type');
            }
        }
        const nodeIds = new Set(nodes.map(n => n.id));
        for (const edge of edges) {
            if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
                throw new common_1.BadRequestException(`Aresta inválida: ${edge.source} -> ${edge.target}`);
            }
        }
    }
    async processReply(companyId, phone, message) {
        const waitingExecutions = await this.prisma.flowExecution.findMany({
            where: {
                companyId,
                contactPhone: phone,
                status: 'WAITING',
            },
            include: {
                flow: true
            }
        });
        for (const execution of waitingExecutions) {
            const variables = execution.variables || {};
            variables.lastReply = message;
            variables.hasReplied = 'true';
            await this.prisma.flowExecution.update({
                where: { id: execution.id },
                data: {
                    status: 'RUNNING',
                    variables,
                }
            });
            await this.flowWaitQueue.add('resume-wait', {
                executionId: execution.id,
                reply: message,
            });
            this.logger.log(`Flow execution resumed: ${execution.id} (reply received)`);
        }
    }
};
exports.FlowsService = FlowsService;
exports.FlowsService = FlowsService = FlowsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('flow-engine')),
    __param(2, (0, bullmq_1.InjectQueue)('flow-message')),
    __param(3, (0, bullmq_1.InjectQueue)('flow-wait')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue,
        bullmq_2.Queue,
        bullmq_2.Queue])
], FlowsService);
//# sourceMappingURL=flows.service.js.map