import { FinancialService } from './financial.service';
export declare class FinancialController {
    private financialService;
    constructor(financialService: FinancialService);
    findAll(user: any, filters: any): Promise<any>;
    getSummary(user: any, filters: any): Promise<{
        totalIncome: any;
        totalExpenses: any;
        balance: number;
        pendingAmount: any;
        pendingCount: any;
        overdueAmount: any;
        overdueCount: any;
    }>;
    getByCategory(user: any, filters: any): Promise<any>;
    findOne(id: string, user: any): Promise<any>;
    create(user: any, dto: any): Promise<any>;
    update(id: string, user: any, dto: any): Promise<any>;
    markPaid(id: string, user: any, paymentData?: any): Promise<any>;
    delete(id: string, user: any): Promise<any>;
    generateOwnerTransfer(user: any, body: {
        contractId: string;
        month: string;
    }): Promise<{
        created: number;
        totalAmount: any;
    }>;
}
