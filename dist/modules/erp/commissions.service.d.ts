import { PrismaService } from '../../common/prisma/prisma.service';
export declare class CommissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string, filters?: any): Promise<any>;
    findOne(id: string, companyId: string): Promise<any>;
    create(companyId: string, dto: any): Promise<any>;
    markPaid(id: string, companyId: string): Promise<any>;
    delete(id: string, companyId: string): Promise<any>;
    generateForContract(companyId: string, contractId: string, commissionRules: any[]): Promise<{
        created: number;
    }>;
    getSummary(companyId: string): Promise<{
        totalAmount: any;
        totalCount: any;
        pendingAmount: any;
        pendingCount: any;
        paidAmount: any;
        paidCount: any;
    }>;
    getByRecipient(companyId: string): Promise<any>;
}
