import { FlowsService } from './flows.service';
import { CreateFlowDto } from './dto/create-flow.dto';
import { UpdateFlowDto } from './dto/update-flow.dto';
import { StartExecutionDto } from './dto/start-execution.dto';
export declare class FlowsController {
    private flowsService;
    constructor(flowsService: FlowsService);
    findAll(user: any): Promise<({
        _count: {
            executions: number;
        };
    } & {
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
        createdBy: string;
    })[]>;
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
    findOne(id: string, user: any): Promise<{
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
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
        createdBy: string;
    }>;
    create(dto: CreateFlowDto, user: any): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
        createdBy: string;
    }>;
    createFromTemplate(templateId: string, name: string, user: any): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
        createdBy: string;
    }>;
    update(id: string, dto: UpdateFlowDto, user: any): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
        createdBy: string;
    }>;
    delete(id: string, user: any): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
        createdBy: string;
    }>;
    publish(id: string, user: any): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
        createdBy: string;
    }>;
    pause(id: string, user: any): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
        createdBy: string;
    }>;
    resume(id: string, user: any): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
        createdBy: string;
    }>;
    archive(id: string, user: any): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
        createdBy: string;
    }>;
    toggle(id: string, user: any): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.FlowStatus;
        nodes: import("@prisma/client/runtime/library").JsonValue;
        edges: import("@prisma/client/runtime/library").JsonValue;
        triggerTypes: string[];
        keywords: string[];
        version: number;
        createdBy: string;
    }>;
    startExecution(flowId: string, dto: StartExecutionDto, user: any): Promise<{
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
    getExecutions(flowId: string, limit: number, user: any): Promise<({
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
    getExecution(executionId: string, user: any): Promise<{
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
    stopExecution(executionId: string, user: any): Promise<{
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
    getAnalytics(flowId: string, user: any): Promise<{
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
}
