import { PrismaService } from '../../common/prisma/prisma.service';
export declare class FlowExecutorService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    onLeadStageChanged(leadId: string, fromStageId: string, toStageId: string, companyId: string): Promise<void>;
    private executeFlowIfTriggerMatches;
    private executeNode;
    private executeCreateTask;
    private executeSendEmail;
    private executeMoveLead;
    private executeNotification;
}
