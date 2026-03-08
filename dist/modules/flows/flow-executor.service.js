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
var FlowExecutorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowExecutorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const TRIGGER_LEAD_STAGE = 'trigger_lead_stage';
const ACTION_CREATE_TASK = 'action_create_task';
const ACTION_SEND_EMAIL = 'action_send_email';
const ACTION_MOVE_LEAD = 'action_move_lead';
const ACTION_NOTIFICATION = 'action_notification';
let FlowExecutorService = FlowExecutorService_1 = class FlowExecutorService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(FlowExecutorService_1.name);
    }
    async onLeadStageChanged(leadId, fromStageId, toStageId, companyId) {
        const flows = await this.prisma.flow.findMany({
            where: {
                companyId,
                status: 'ACTIVE',
                triggerTypes: { has: 'LEAD_STAGE_CHANGED' },
            },
        });
        const lead = await this.prisma.lead.findFirst({
            where: { id: leadId, companyId },
            include: { stage: true, pipeline: true },
        });
        if (!lead)
            return;
        for (const flow of flows) {
            try {
                await this.executeFlowIfTriggerMatches(flow, leadId, companyId, fromStageId, toStageId, lead.pipelineId);
            }
            catch (err) {
                this.logger.error(`Flow ${flow.id} execution failed: ${err?.message}`);
            }
        }
    }
    async executeFlowIfTriggerMatches(flow, leadId, companyId, fromStageId, toStageId, leadPipelineId) {
        const nodes = flow.nodes || [];
        const edges = flow.edges || [];
        const triggerNode = nodes.find((n) => n.type === TRIGGER_LEAD_STAGE || (n.type === 'trigger' && n.data?.triggerType === 'LEAD_STAGE_CHANGED'));
        if (!triggerNode)
            return;
        const d = triggerNode.data || {};
        if (d.pipelineId && d.pipelineId !== leadPipelineId)
            return;
        if (d.fromStageId && d.fromStageId !== fromStageId)
            return;
        if (d.toStageId && d.toStageId !== 'qualquer' && d.toStageId !== 'any' && d.toStageId !== toStageId)
            return;
        const targetIds = edges.filter((e) => e.source === triggerNode.id).map((e) => e.target);
        const executed = new Set();
        for (const nodeId of targetIds) {
            const node = nodes.find((n) => n.id === nodeId);
            if (!node || executed.has(node.id))
                continue;
            await this.executeNode(node, leadId, companyId, nodes, edges, executed);
        }
    }
    async executeNode(node, leadId, companyId, nodes, edges, executed) {
        if (executed.has(node.id))
            return;
        executed.add(node.id);
        const data = node.data || {};
        switch (node.type) {
            case ACTION_CREATE_TASK:
                await this.executeCreateTask(leadId, companyId, data);
                break;
            case ACTION_SEND_EMAIL:
                await this.executeSendEmail(leadId, companyId, data);
                break;
            case ACTION_MOVE_LEAD:
                await this.executeMoveLead(leadId, companyId, data);
                break;
            case ACTION_NOTIFICATION:
                await this.executeNotification(leadId, companyId, data);
                break;
            default:
                if (node.type?.startsWith('action_')) {
                    this.logger.warn(`Unknown action type: ${node.type}`);
                }
        }
        const nextIds = edges.filter((e) => e.source === node.id).map((e) => e.target);
        for (const nextId of nextIds) {
            const nextNode = nodes.find((n) => n.id === nextId);
            if (nextNode)
                await this.executeNode(nextNode, leadId, companyId, nodes, edges, executed);
        }
    }
    async executeCreateTask(leadId, companyId, data) {
        const dueInDays = Number(data.dueInDays) || 1;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + dueInDays);
        const lead = await this.prisma.lead.findFirst({
            where: { id: leadId, companyId },
            select: { userId: true },
        });
        const userId = data.assignToUserId || lead?.userId;
        await this.prisma.task.create({
            data: {
                companyId,
                leadId,
                userId: userId || (await this.prisma.user.findFirst({ where: { companyId }, select: { id: true } }))?.id,
                title: data.title || 'Tarefa automática',
                description: data.description || null,
                type: 'CALL',
                dueDate,
                status: 'PENDING',
            },
        });
        this.logger.log(`Task created for lead ${leadId}`);
    }
    async executeSendEmail(leadId, companyId, data) {
        const lead = await this.prisma.lead.findFirst({
            where: { id: leadId, companyId },
        });
        if (!lead)
            return;
        let body = (data.body || '').replace(/\{\{lead\.name\}\}/g, lead.name).replace(/\{\{lead\.email\}\}/g, lead.email || '');
        const to = data.to === 'corretor' || data.to === 'responsible' ? (lead.userId ? 'user' : 'lead') : 'lead';
        this.logger.log(`[Flow] Email would send to ${to}: ${data.subject} - ${body.slice(0, 80)}...`);
    }
    async executeMoveLead(leadId, companyId, data) {
        if (!data.stageId)
            return;
        const stage = await this.prisma.stage.findFirst({
            where: { id: data.stageId },
        });
        if (!stage)
            return;
        if (data.pipelineId && stage.pipelineId !== data.pipelineId)
            return;
        await this.prisma.lead.update({
            where: { id: leadId },
            data: {
                stageId: data.stageId,
                pipelineId: stage.pipelineId,
                probability: stage.probability,
                lastInteraction: new Date(),
            },
        });
        this.logger.log(`Lead ${leadId} moved to stage ${data.stageId}`);
    }
    async executeNotification(leadId, companyId, data) {
        this.logger.log(`[Flow] Internal notification: ${data.message} (to: ${data.to || data.userId || 'all'})`);
    }
};
exports.FlowExecutorService = FlowExecutorService;
exports.FlowExecutorService = FlowExecutorService = FlowExecutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FlowExecutorService);
//# sourceMappingURL=flow-executor.service.js.map