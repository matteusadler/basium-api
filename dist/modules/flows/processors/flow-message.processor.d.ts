import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma/prisma.service';
interface SendMessageJob {
    executionId: string;
    phone: string;
    type: string;
    content: string;
    mediaUrl?: string;
    companyId: string;
}
export declare class FlowMessageProcessor extends WorkerHost {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    process(job: Job<SendMessageJob>): Promise<any>;
    private sendWhatsAppMessage;
    onCompleted(job: Job): void;
    onFailed(job: Job, error: Error): void;
}
export {};
