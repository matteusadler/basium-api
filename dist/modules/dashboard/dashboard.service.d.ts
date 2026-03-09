import { PrismaService } from '../../common/prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(companyId: string): Promise<{
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
    getLeadsChart(companyId: string, period?: string): Promise<{
        novos: number;
        ganhos: number;
        perdidos: number;
        period: string;
    }[]>;
    getPipelineStats(companyId: string): Promise<any>;
    getRecentActivity(companyId: string, limit?: number): Promise<any[]>;
    getTodayTasks(companyId: string, userId?: string): Promise<any>;
    getLeadsByTemperature(companyId: string): Promise<{
        hot: any;
        warm: any;
        cold: any;
    }>;
    getLeadsByOrigin(companyId: string): Promise<any>;
}
