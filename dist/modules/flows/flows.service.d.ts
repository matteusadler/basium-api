import { Queue } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateFlowDto } from './dto/create-flow.dto';
import { UpdateFlowDto } from './dto/update-flow.dto';
import { StartExecutionDto } from './dto/start-execution.dto';
export declare class FlowsService {
    private prisma;
    private flowEngineQueue;
    private flowMessageQueue;
    private flowWaitQueue;
    private readonly logger;
    constructor(prisma: PrismaService, flowEngineQueue: Queue, flowMessageQueue: Queue, flowWaitQueue: Queue);
    findAll(companyId: string): Promise<({
        _count: {
            executions: number;
        };
    } & {
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
    })[]>;
    findOne(id: string, companyId: string): Promise<{
        executions: {
            lead: {
                id: string;
                name: string;
                phone: string;
            };
            id: string;
            status: import(".prisma/client").$Enums.ExecStatus;
            startedAt: Date;
            completedAt: Date;
        }[];
    } & {
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
    }>;
    create(companyId: string, userId: string, dto: CreateFlowDto): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
    }>;
    update(id: string, companyId: string, dto: UpdateFlowDto): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
    }>;
    delete(id: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
    }>;
    publish(id: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
    }>;
    pause(id: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
    }>;
    resume(id: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
    }>;
    archive(id: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
    }>;
    toggle(id: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
    }>;
    startExecution(flowId: string, companyId: string, dto: StartExecutionDto): Promise<{
        id: string;
        companyId: string;
        status: import(".prisma/client").$Enums.ExecStatus;
        leadId: string;
        contactPhone: string;
        variables: import("@prisma/client/runtime/library").JsonValue;
        startedAt: Date;
        flowId: string;
        currentNodeId: string | null;
        completedAt: Date | null;
    }>;
    stopExecution(executionId: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        status: import(".prisma/client").$Enums.ExecStatus;
        leadId: string;
        contactPhone: string;
        variables: import("@prisma/client/runtime/library").JsonValue;
        startedAt: Date;
        flowId: string;
        currentNodeId: string | null;
        completedAt: Date | null;
    }>;
    getExecution(executionId: string, companyId: string): Promise<{
        lead: {
            id: string;
            name: string;
            phone: string;
        };
        flow: {
            id: string;
            name: string;
        };
        steps: {
            error: string | null;
            id: string;
            status: import(".prisma/client").$Enums.StepStatus;
            executedAt: Date;
            executionId: string;
            nodeId: string;
            nodeType: string;
            input: import("@prisma/client/runtime/library").JsonValue | null;
            output: import("@prisma/client/runtime/library").JsonValue | null;
            duration: number | null;
        }[];
    } & {
        id: string;
        companyId: string;
        status: import(".prisma/client").$Enums.ExecStatus;
        leadId: string;
        contactPhone: string;
        variables: import("@prisma/client/runtime/library").JsonValue;
        startedAt: Date;
        flowId: string;
        currentNodeId: string | null;
        completedAt: Date | null;
    }>;
    getExecutions(flowId: string, companyId: string, limit?: number): Promise<({
        lead: {
            id: string;
            name: string;
            phone: string;
        };
    } & {
        id: string;
        companyId: string;
        status: import(".prisma/client").$Enums.ExecStatus;
        leadId: string;
        contactPhone: string;
        variables: import("@prisma/client/runtime/library").JsonValue;
        startedAt: Date;
        flowId: string;
        currentNodeId: string | null;
        completedAt: Date | null;
    })[]>;
    triggerByKeyword(companyId: string, leadId: string, phone: string, message: string): Promise<void>;
    triggerByFirstMessage(companyId: string, leadId: string, phone: string): Promise<void>;
    getFlowAnalytics(flowId: string, companyId: string): Promise<{
        flowId: string;
        flowName: string;
        totalExecutions: number;
        completedExecutions: number;
        runningExecutions: number;
        conversionRate: number;
        nodeAnalytics: {
            nodeId: any;
            nodeType: any;
            label: any;
            executed: number;
            completed: number;
            failed: number;
            successRate: number;
        }[];
    }>;
    getTemplates(): Promise<{
        id: string;
        companyId: string | null;
        name: string;
        createdAt: Date;
        description: string;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        category: string;
        isPublic: boolean;
        usageCount: number;
    }[]>;
    createFromTemplate(templateId: string, companyId: string, userId: string, name: string): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
    }>;
    private validateFlow;
    processReply(companyId: string, phone: string, message: string): Promise<void>;
}
