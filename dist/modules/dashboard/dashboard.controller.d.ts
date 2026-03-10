import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(req: any): Promise<{
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
    getLeadsChart(req: any, period?: string): Promise<{
        novos: number;
        ganhos: number;
        perdidos: number;
        period: string;
    }[]>;
    getPipelineStats(req: any): Promise<{
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
    getRecentActivity(req: any, limit?: string): Promise<({
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
    getTodayTasks(req: any): Promise<({
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
    getLeadsByTemperature(req: any): Promise<{
        hot: number;
        warm: number;
        cold: number;
    }>;
    getLeadsByOrigin(req: any): Promise<{
        origin: string;
        count: number;
    }[]>;
}
