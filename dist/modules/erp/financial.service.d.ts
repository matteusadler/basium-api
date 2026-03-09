import { PrismaService } from '../../common/prisma/prisma.service';
export declare class FinancialService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string, filters?: any): Promise<any>;
    findOne(id: string, companyId: string): Promise<any>;
    create(companyId: string, dto: any): Promise<any>;
    update(id: string, companyId: string, dto: any): Promise<any>;
    markPaid(id: string, companyId: string, paymentData?: any): Promise<any>;
    delete(id: string, companyId: string): Promise<any>;
    generateOwnerTransfer(companyId: string, contractId: string, month: string): Promise<{
        created: number;
        totalAmount: any;
    }>;
    getSummary(companyId: string, filters?: any): Promise<{
        totalIncome: any;
        totalExpenses: any;
        balance: number;
        pendingAmount: any;
        pendingCount: any;
        overdueAmount: any;
        overdueCount: any;
    }>;
    getByCategory(companyId: string, filters?: any): Promise<any>;
}
