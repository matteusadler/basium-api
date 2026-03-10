import { PrismaService } from '../../common/prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(companyId: string): Promise<{
        leads: {
            total: number;
            active: number;
            won: number;
            lost: number;
            thisMonth: number;
            growth: number;
        };
        tasks: {
            total: number;
            pending: number;
            overdue: number;
        };
        revenue: {
            total: number;
            thisMonth: number;
            wonThisMonth: number;
        };
        properties: {
            total: number;
        };
        contracts: {
            active: number;
        };
        conversionRate: number;
    }>;
    getLeadsChart(companyId: string, period?: string): Promise<{
        novos: number;
        ganhos: number;
        perdidos: number;
        period: string;
    }[]>;
    getPipelineStats(companyId: string): Promise<{
        id: string;
        name: string;
        type: string;
        stages: {
            id: string;
            name: string;
            color: string;
            order: number;
            leadsCount: number;
            probability: number;
        }[];
    }[]>;
    getRecentActivity(companyId: string, limit?: number): Promise<({
        type: "lead_created";
        id: string;
        title: string;
        description: string;
        temperature: import(".prisma/client").$Enums.Temperature;
        stage: {
            name: string;
            color: string;
        };
        createdAt: Date;
    } | {
        type: "task_created";
        id: string;
        title: string;
        description: string;
        taskType: import(".prisma/client").$Enums.TaskType;
        status: import(".prisma/client").$Enums.TaskStatus;
        dueDate: Date;
        createdAt: Date;
    })[]>;
    getTodayTasks(companyId: string, userId?: string): Promise<({
        lead: {
            id: string;
            name: string;
            phone: string;
        };
    } & {
        result: string | null;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        type: import(".prisma/client").$Enums.TaskType;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string | null;
    })[]>;
    getLeadsByTemperature(companyId: string): Promise<{
        hot: number;
        warm: number;
        cold: number;
    }>;
    getLeadsByOrigin(companyId: string): Promise<{
        origin: string;
        count: number;
    }[]>;
}
