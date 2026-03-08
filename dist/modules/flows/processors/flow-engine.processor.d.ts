import { WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../../../common/prisma/prisma.service';
interface ProcessNodeJob {
    executionId: string;
    nodeId: string;
}
export declare class FlowEngineProcessor extends WorkerHost {
    private prisma;
    private flowEngineQueue;
    private flowMessageQueue;
    private flowWaitQueue;
    private readonly logger;
    constructor(prisma: PrismaService, flowEngineQueue: Queue, flowMessageQueue: Queue, flowWaitQueue: Queue);
    process(job: Job<ProcessNodeJob>): Promise<any>;
    private processTrigger;
    private processMessage;
    private processCondition;
    private processWait;
    private processAction;
    private processAI;
    private processSplitAB;
    private processJump;
    private getNextNode;
    private getConditionalNextNode;
    private getABNextNode;
    private replaceVariables;
    private getFieldValue;
    onCompleted(job: Job): void;
    onFailed(job: Job, error: Error): void;
}
export {};
