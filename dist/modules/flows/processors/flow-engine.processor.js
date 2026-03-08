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
var FlowEngineProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowEngineProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bullmq_2 = require("bullmq");
const bullmq_3 = require("@nestjs/bullmq");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const create_flow_dto_1 = require("../dto/create-flow.dto");
let FlowEngineProcessor = FlowEngineProcessor_1 = class FlowEngineProcessor extends bullmq_1.WorkerHost {
    constructor(prisma, flowEngineQueue, flowMessageQueue, flowWaitQueue) {
        super();
        this.prisma = prisma;
        this.flowEngineQueue = flowEngineQueue;
        this.flowMessageQueue = flowMessageQueue;
        this.flowWaitQueue = flowWaitQueue;
        this.logger = new common_1.Logger(FlowEngineProcessor_1.name);
    }
    async process(job) {
        const { executionId, nodeId } = job.data;
        const startTime = Date.now();
        this.logger.log(`Processing node ${nodeId} for execution ${executionId}`);
        try {
            const execution = await this.prisma.flowExecution.findUnique({
                where: { id: executionId },
                include: {
                    flow: true,
                    lead: true,
                },
            });
            if (!execution || execution.status === 'CANCELLED') {
                this.logger.warn(`Execution ${executionId} not found or cancelled`);
                return { status: 'skipped', reason: 'execution_not_found_or_cancelled' };
            }
            const nodes = execution.flow.nodes;
            const edges = execution.flow.edges;
            const node = nodes.find(n => n.id === nodeId);
            if (!node) {
                this.logger.error(`Node ${nodeId} not found in flow`);
                return { status: 'error', reason: 'node_not_found' };
            }
            const step = await this.prisma.flowStep.create({
                data: {
                    executionId,
                    nodeId,
                    nodeType: node.type,
                    status: 'RUNNING',
                    input: { nodeData: node.data, variables: execution.variables },
                },
            });
            let result;
            let nextNodeId = null;
            try {
                switch (node.type) {
                    case create_flow_dto_1.NodeType.TRIGGER:
                        result = await this.processTrigger(node, execution);
                        nextNodeId = this.getNextNode(nodeId, edges);
                        break;
                    case create_flow_dto_1.NodeType.MESSAGE:
                        result = await this.processMessage(node, execution);
                        nextNodeId = this.getNextNode(nodeId, edges);
                        break;
                    case create_flow_dto_1.NodeType.CONDITION:
                        result = await this.processCondition(node, execution);
                        nextNodeId = this.getConditionalNextNode(nodeId, edges, result.branch);
                        break;
                    case create_flow_dto_1.NodeType.WAIT:
                        result = await this.processWait(node, execution, step.id);
                        break;
                    case create_flow_dto_1.NodeType.ACTION:
                        result = await this.processAction(node, execution);
                        nextNodeId = this.getNextNode(nodeId, edges);
                        break;
                    case create_flow_dto_1.NodeType.AI:
                        result = await this.processAI(node, execution);
                        nextNodeId = this.getNextNode(nodeId, edges);
                        break;
                    case create_flow_dto_1.NodeType.SPLIT_AB:
                        result = await this.processSplitAB(node, execution);
                        nextNodeId = this.getABNextNode(nodeId, edges, result.variant);
                        break;
                    case create_flow_dto_1.NodeType.JUMP:
                        result = await this.processJump(node, execution);
                        nextNodeId = node.data.targetNodeId || null;
                        break;
                    default:
                        this.logger.warn(`Unknown node type: ${node.type}`);
                        result = { status: 'skipped', reason: 'unknown_type' };
                        nextNodeId = this.getNextNode(nodeId, edges);
                }
                const duration = Date.now() - startTime;
                await this.prisma.flowStep.update({
                    where: { id: step.id },
                    data: {
                        status: 'COMPLETED',
                        output: result,
                        duration,
                    },
                });
                if (nextNodeId && execution.status !== 'WAITING') {
                    await this.prisma.flowExecution.update({
                        where: { id: executionId },
                        data: { currentNodeId: nextNodeId },
                    });
                    await this.flowEngineQueue.add('process-node', {
                        executionId,
                        nodeId: nextNodeId,
                    }, { delay: (node.data.delay || 0) * 1000 });
                }
                else if (!nextNodeId && node.type !== create_flow_dto_1.NodeType.WAIT) {
                    await this.prisma.flowExecution.update({
                        where: { id: executionId },
                        data: {
                            status: 'COMPLETED',
                            completedAt: new Date(),
                        },
                    });
                    this.logger.log(`Flow execution completed: ${executionId}`);
                }
                return result;
            }
            catch (error) {
                await this.prisma.flowStep.update({
                    where: { id: step.id },
                    data: {
                        status: 'FAILED',
                        error: error.message,
                        duration: Date.now() - startTime,
                    },
                });
                throw error;
            }
        }
        catch (error) {
            this.logger.error(`Error processing node ${nodeId}: ${error.message}`);
            await this.prisma.flowExecution.update({
                where: { id: executionId },
                data: {
                    status: 'FAILED',
                    completedAt: new Date(),
                },
            });
            throw error;
        }
    }
    async processTrigger(node, execution) {
        return {
            type: 'trigger',
            triggerType: node.data.triggerType,
            status: 'activated',
        };
    }
    async processMessage(node, execution) {
        const { messageType, content, mediaUrl } = node.data;
        const processedContent = this.replaceVariables(content, execution);
        await this.flowMessageQueue.add('send-message', {
            executionId: execution.id,
            phone: execution.contactPhone,
            type: messageType || 'TEXT',
            content: processedContent,
            mediaUrl,
            companyId: execution.companyId,
        });
        return {
            type: 'message',
            messageType,
            content: processedContent,
            status: 'queued',
        };
    }
    async processCondition(node, execution) {
        const { field, operator, value } = node.data;
        const variables = execution.variables || {};
        let fieldValue = this.getFieldValue(field, execution, variables);
        let result = false;
        const compareValue = this.replaceVariables(value, execution);
        switch (operator) {
            case 'EQUALS':
                result = String(fieldValue).toLowerCase() === String(compareValue).toLowerCase();
                break;
            case 'NOT_EQUALS':
                result = String(fieldValue).toLowerCase() !== String(compareValue).toLowerCase();
                break;
            case 'CONTAINS':
                result = String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());
                break;
            case 'NOT_CONTAINS':
                result = !String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());
                break;
            case 'CONTAINS_ANY':
                const anyValues = String(compareValue).split(',').map(v => v.trim().toLowerCase());
                result = anyValues.some(v => String(fieldValue).toLowerCase().includes(v));
                break;
            case 'GREATER_THAN':
                result = Number(fieldValue) > Number(compareValue);
                break;
            case 'LESS_THAN':
                result = Number(fieldValue) < Number(compareValue);
                break;
            case 'IS_EMPTY':
                result = !fieldValue || String(fieldValue).trim() === '';
                break;
            case 'IS_NOT_EMPTY':
                result = fieldValue && String(fieldValue).trim() !== '';
                break;
            default:
                this.logger.warn(`Unknown operator: ${operator}`);
        }
        return {
            type: 'condition',
            field,
            operator,
            value: compareValue,
            fieldValue,
            result,
            branch: result ? 'yes' : 'no',
        };
    }
    async processWait(node, execution, stepId) {
        const { waitType, delaySeconds, timeout, timeoutAction } = node.data;
        if (waitType === 'DELAY') {
            await this.flowWaitQueue.add('resume-delay', {
                executionId: execution.id,
                stepId,
                nodeId: node.id,
            }, { delay: (delaySeconds || 60) * 1000 });
            return {
                type: 'wait',
                waitType: 'DELAY',
                delaySeconds,
                status: 'waiting',
            };
        }
        if (waitType === 'UNTIL_REPLY') {
            await this.prisma.flowExecution.update({
                where: { id: execution.id },
                data: { status: 'WAITING' },
            });
            if (timeout) {
                await this.flowWaitQueue.add('check-timeout', {
                    executionId: execution.id,
                    stepId,
                    nodeId: node.id,
                    timeoutAction: timeoutAction || 'END',
                }, { delay: timeout * 1000 });
            }
            return {
                type: 'wait',
                waitType: 'UNTIL_REPLY',
                timeout,
                status: 'waiting_for_reply',
            };
        }
        return { type: 'wait', status: 'unknown_wait_type' };
    }
    async processAction(node, execution) {
        const { actionType, field, value, taskType, title, priority, dueDays, stageName, tag } = node.data;
        const processedValue = this.replaceVariables(value, execution);
        const processedTitle = this.replaceVariables(title, execution);
        switch (actionType) {
            case 'UPDATE_LEAD':
                await this.prisma.lead.update({
                    where: { id: execution.leadId },
                    data: { [field]: processedValue },
                });
                return { type: 'action', actionType, field, value: processedValue, status: 'updated' };
            case 'ADD_TAG':
                const lead = await this.prisma.lead.findUnique({ where: { id: execution.leadId } });
                const tags = [...(lead?.tags || []), tag];
                await this.prisma.lead.update({
                    where: { id: execution.leadId },
                    data: { tags },
                });
                return { type: 'action', actionType, tag, status: 'tag_added' };
            case 'REMOVE_TAG':
                const leadForRemove = await this.prisma.lead.findUnique({ where: { id: execution.leadId } });
                const filteredTags = (leadForRemove?.tags || []).filter(t => t !== tag);
                await this.prisma.lead.update({
                    where: { id: execution.leadId },
                    data: { tags: filteredTags },
                });
                return { type: 'action', actionType, tag, status: 'tag_removed' };
            case 'CREATE_TASK':
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + (dueDays || 1));
                await this.prisma.task.create({
                    data: {
                        companyId: execution.companyId,
                        leadId: execution.leadId,
                        userId: execution.lead?.userId || '',
                        title: processedTitle,
                        type: taskType || 'OTHER',
                        priority: priority || 'MEDIUM',
                        status: 'PENDING',
                        dueDate,
                    },
                });
                return { type: 'action', actionType, title: processedTitle, status: 'task_created' };
            case 'MOVE_STAGE':
                const stage = await this.prisma.stage.findFirst({
                    where: { name: stageName, pipeline: { companyId: execution.companyId } },
                });
                if (stage) {
                    await this.prisma.lead.update({
                        where: { id: execution.leadId },
                        data: { stageId: stage.id },
                    });
                    await this.prisma.leadHistory.create({
                        data: {
                            leadId: execution.leadId,
                            userId: 'system',
                            event: 'STAGE_CHANGED',
                            metadata: { fromFlow: execution.flowId, stageName },
                        },
                    });
                }
                return { type: 'action', actionType, stageName, status: stage ? 'stage_changed' : 'stage_not_found' };
            default:
                return { type: 'action', actionType, status: 'unknown_action' };
        }
    }
    async processAI(node, execution) {
        const { aiAction, prompt, updateTemperature, transferAfter } = node.data;
        const user = await this.prisma.user.findUnique({
            where: { id: execution.lead?.userId || '' },
        });
        if (!user?.openaiKey) {
            return { type: 'ai', status: 'no_api_key', message: 'Chave OpenAI não configurada' };
        }
        return {
            type: 'ai',
            aiAction,
            prompt: this.replaceVariables(prompt, execution),
            status: 'processed',
            updateTemperature,
            transferAfter,
        };
    }
    async processSplitAB(node, execution) {
        const { variants, splitName } = node.data;
        if (!variants || variants.length === 0) {
            return { type: 'split_ab', status: 'no_variants' };
        }
        const random = Math.random() * 100;
        let cumulative = 0;
        let selectedVariant = variants[0];
        for (const variant of variants) {
            cumulative += variant.percentage || 50;
            if (random <= cumulative) {
                selectedVariant = variant;
                break;
            }
        }
        return {
            type: 'split_ab',
            splitName,
            variant: selectedVariant.id,
            variantLabel: selectedVariant.label,
            status: 'variant_selected',
        };
    }
    async processJump(node, execution) {
        const { targetNodeId, targetFlowId } = node.data;
        if (targetFlowId && targetFlowId !== execution.flowId) {
            return {
                type: 'jump',
                targetFlowId,
                status: 'cross_flow_jump_not_implemented',
            };
        }
        return {
            type: 'jump',
            targetNodeId,
            status: 'jumping',
        };
    }
    getNextNode(nodeId, edges) {
        const edge = edges.find(e => e.source === nodeId && (!e.sourceHandle || e.sourceHandle === 'default'));
        return edge?.target || null;
    }
    getConditionalNextNode(nodeId, edges, branch) {
        const edge = edges.find(e => e.source === nodeId && e.sourceHandle === branch);
        return edge?.target || null;
    }
    getABNextNode(nodeId, edges, variant) {
        const edge = edges.find(e => e.source === nodeId && e.sourceHandle === variant);
        return edge?.target || null;
    }
    replaceVariables(text, execution) {
        if (!text)
            return text;
        const variables = execution.variables || {};
        const lead = execution.lead || {};
        let result = text
            .replace(/{{lead\.name}}/g, lead.name || '')
            .replace(/{{lead\.phone}}/g, lead.phone || '')
            .replace(/{{lead\.email}}/g, lead.email || '')
            .replace(/{{lastReply}}/g, variables.lastReply || '')
            .replace(/{{triggerMessage}}/g, variables.triggerMessage || '');
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }
        return result;
    }
    getFieldValue(field, execution, variables) {
        if (field.startsWith('lead.')) {
            const leadField = field.replace('lead.', '');
            return execution.lead?.[leadField];
        }
        return variables[field];
    }
    onCompleted(job) {
        this.logger.debug(`Job ${job.id} completed`);
    }
    onFailed(job, error) {
        this.logger.error(`Job ${job.id} failed: ${error.message}`);
    }
};
exports.FlowEngineProcessor = FlowEngineProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], FlowEngineProcessor.prototype, "onCompleted", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", void 0)
], FlowEngineProcessor.prototype, "onFailed", null);
exports.FlowEngineProcessor = FlowEngineProcessor = FlowEngineProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('flow-engine', { connection: { host: 'localhost', port: 6379 } }),
    __param(1, (0, bullmq_3.InjectQueue)('flow-engine')),
    __param(2, (0, bullmq_3.InjectQueue)('flow-message')),
    __param(3, (0, bullmq_3.InjectQueue)('flow-wait')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue,
        bullmq_2.Queue,
        bullmq_2.Queue])
], FlowEngineProcessor);
//# sourceMappingURL=flow-engine.processor.js.map