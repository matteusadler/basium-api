import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(req: any): Promise<{
        leads: {
            total: any;
            active: any;
            won: any;
            lost: any;
            thisMonth: any;
            growth: number;
        };
        tasks: {
            total: any;
            pending: any;
            overdue: any;
        };
        revenue: {
            total: any;
            thisMonth: any;
            wonThisMonth: any;
        };
        properties: {
            total: any;
        };
        contracts: {
            active: any;
        };
        conversionRate: number;
    }>;
    getLeadsChart(req: any, period?: string): Promise<{
        novos: number;
        ganhos: number;
        perdidos: number;
        period: string;
    }[]>;
    getPipelineStats(req: any): Promise<any>;
    getRecentActivity(req: any, limit?: string): Promise<any[]>;
    getTodayTasks(req: any): Promise<any>;
    getLeadsByTemperature(req: any): Promise<{
        hot: any;
        warm: any;
        cold: any;
    }>;
    getLeadsByOrigin(req: any): Promise<any>;
}
