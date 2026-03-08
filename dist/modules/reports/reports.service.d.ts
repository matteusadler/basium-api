import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(companyId: string): Promise<{
        leads: number;
        tasks: number;
        conversations: number;
    }>;
}
