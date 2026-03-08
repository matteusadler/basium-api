import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getDashboardStats(user: any): Promise<{
        leads: number;
        tasks: number;
        conversations: number;
    }>;
}
