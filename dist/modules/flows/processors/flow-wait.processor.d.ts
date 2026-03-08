import { WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../../../common/prisma/prisma.service';
export declare class FlowWaitProcessor extends WorkerHost {
    private prisma;
    private flowEngineQueue;
    private readonly logger;
    constructor(prisma: PrismaService, flowEngineQueue: Queue);
    process(job: Job): Promise<any>;
    private handleResumeDelay;
    private handleResumeWait;
    private handleCheckTimeout;
    onCompleted(job: Job): void;
    onFailed(job: Job, error: Error): void;
}
