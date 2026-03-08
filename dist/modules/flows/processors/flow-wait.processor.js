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
var FlowWaitProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowWaitProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bullmq_2 = require("bullmq");
const bullmq_3 = require("@nestjs/bullmq");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
let FlowWaitProcessor = FlowWaitProcessor_1 = class FlowWaitProcessor extends bullmq_1.WorkerHost {
    constructor(prisma, flowEngineQueue) {
        super();
        this.prisma = prisma;
        this.flowEngineQueue = flowEngineQueue;
        this.logger = new common_1.Logger(FlowWaitProcessor_1.name);
    }
    async process(job) {
        const { name, data } = job;
        switch (name) {
            case 'resume-delay':
                return this.handleResumeDelay(data);
            case 'resume-wait':
                return this.handleResumeWait(data);
            case 'check-timeout':
                return this.handleCheckTimeout(data);
            default:
                this.logger.warn(`Unknown job name: ${name}`);
                return { status: 'unknown_job' };
        }
    }
    async handleResumeDelay(data) {
        const { executionId, stepId, nodeId } = data;
        this.logger.log(`Resuming execution ${executionId} after delay`);
        try {
            const execution = await this.prisma.flowExecution.findUnique({
                where: { id: executionId },
                include: { flow: true },
            });
            if (!execution || execution.status === 'CANCELLED') {
                return { status: 'skipped', reason: 'execution_not_found_or_cancelled' };
            }
            await this.prisma.flowStep.update({
                where: { id: stepId },
                data: { status: 'COMPLETED' },
            });
            const edges = execution.flow.edges;
            const nextEdge = edges.find(e => e.source === nodeId);
            if (nextEdge) {
                await this.prisma.flowExecution.update({
                    where: { id: executionId },
                    data: { currentNodeId: nextEdge.target },
                });
                await this.flowEngineQueue.add('process-node', {
                    executionId,
                    nodeId: nextEdge.target,
                });
                return { status: 'resumed', nextNode: nextEdge.target };
            }
            else {
                await this.prisma.flowExecution.update({
                    where: { id: executionId },
                    data: {
                        status: 'COMPLETED',
                        completedAt: new Date(),
                    },
                });
                return { status: 'completed' };
            }
        }
        catch (error) {
            this.logger.error(`Error resuming delay: ${error.message}`);
            throw error;
        }
    }
    async handleResumeWait(data) {
        const { executionId, reply } = data;
        this.logger.log(`Resuming execution ${executionId} after reply`);
        try {
            const execution = await this.prisma.flowExecution.findUnique({
                where: { id: executionId },
                include: { flow: true },
            });
            if (!execution || execution.status !== 'RUNNING') {
                return { status: 'skipped', reason: 'not_running' };
            }
            const currentNodeId = execution.currentNodeId;
            if (!currentNodeId) {
                return { status: 'skipped', reason: 'no_current_node' };
            }
            const waitStep = await this.prisma.flowStep.findFirst({
                where: {
                    executionId,
                    nodeId: currentNodeId,
                    status: 'PENDING',
                },
                orderBy: { executedAt: 'desc' },
            });
            if (waitStep) {
                await this.prisma.flowStep.update({
                    where: { id: waitStep.id },
                    data: {
                        status: 'COMPLETED',
                        output: { reply, receivedAt: new Date().toISOString() },
                    },
                });
            }
            const edges = execution.flow.edges;
            const replyEdge = edges.find(e => e.source === currentNodeId && (e.sourceHandle === 'replied' || !e.sourceHandle));
            if (replyEdge) {
                await this.prisma.flowExecution.update({
                    where: { id: executionId },
                    data: { currentNodeId: replyEdge.target },
                });
                await this.flowEngineQueue.add('process-node', {
                    executionId,
                    nodeId: replyEdge.target,
                });
                return { status: 'resumed', nextNode: replyEdge.target };
            }
            return { status: 'no_next_node' };
        }
        catch (error) {
            this.logger.error(`Error resuming wait: ${error.message}`);
            throw error;
        }
    }
    async handleCheckTimeout(data) {
        const { executionId, stepId, nodeId, timeoutAction } = data;
        this.logger.log(`Checking timeout for execution ${executionId}`);
        try {
            const execution = await this.prisma.flowExecution.findUnique({
                where: { id: executionId },
                include: { flow: true },
            });
            if (!execution || execution.status !== 'WAITING') {
                return { status: 'skipped', reason: 'not_waiting' };
            }
            await this.prisma.flowStep.update({
                where: { id: stepId },
                data: {
                    status: 'COMPLETED',
                    output: { timeout: true, action: timeoutAction },
                },
            });
            const variables = execution.variables || {};
            variables.hasReplied = 'false';
            variables.timedOut = 'true';
            await this.prisma.flowExecution.update({
                where: { id: executionId },
                data: {
                    status: 'RUNNING',
                    variables,
                },
            });
            switch (timeoutAction) {
                case 'END':
                    await this.prisma.flowExecution.update({
                        where: { id: executionId },
                        data: {
                            status: 'COMPLETED',
                            completedAt: new Date(),
                        },
                    });
                    return { status: 'ended_by_timeout' };
                case 'CONTINUE':
                    const edges = execution.flow.edges;
                    const nextEdge = edges.find(e => e.source === nodeId && e.sourceHandle === 'timeout') ||
                        edges.find(e => e.source === nodeId);
                    if (nextEdge) {
                        await this.prisma.flowExecution.update({
                            where: { id: executionId },
                            data: { currentNodeId: nextEdge.target },
                        });
                        await this.flowEngineQueue.add('process-node', {
                            executionId,
                            nodeId: nextEdge.target,
                        });
                        return { status: 'continued_after_timeout', nextNode: nextEdge.target };
                    }
                    await this.prisma.flowExecution.update({
                        where: { id: executionId },
                        data: {
                            status: 'COMPLETED',
                            completedAt: new Date(),
                        },
                    });
                    return { status: 'ended_no_next_node' };
                default:
                    return { status: 'unknown_timeout_action' };
            }
        }
        catch (error) {
            this.logger.error(`Error checking timeout: ${error.message}`);
            throw error;
        }
    }
    onCompleted(job) {
        this.logger.debug(`Wait job ${job.id} completed`);
    }
    onFailed(job, error) {
        this.logger.error(`Wait job ${job.id} failed: ${error.message}`);
    }
};
exports.FlowWaitProcessor = FlowWaitProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], FlowWaitProcessor.prototype, "onCompleted", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", void 0)
], FlowWaitProcessor.prototype, "onFailed", null);
exports.FlowWaitProcessor = FlowWaitProcessor = FlowWaitProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('flow-wait', { connection: { host: 'localhost', port: 6379 } }),
    __param(1, (0, bullmq_3.InjectQueue)('flow-engine')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], FlowWaitProcessor);
//# sourceMappingURL=flow-wait.processor.js.map