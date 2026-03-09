import { CommissionsService } from './commissions.service';
export declare class CommissionsController {
    private commissionsService;
    constructor(commissionsService: CommissionsService);
    findAll(user: any, filters: any): Promise<any>;
    getSummary(user: any): Promise<{
        totalAmount: any;
        totalCount: any;
        pendingAmount: any;
        pendingCount: any;
        paidAmount: any;
        paidCount: any;
    }>;
    getByRecipient(user: any): Promise<any>;
    findOne(id: string, user: any): Promise<any>;
    create(user: any, dto: any): Promise<any>;
    markPaid(id: string, user: any): Promise<any>;
    delete(id: string, user: any): Promise<any>;
    generateForContract(contractId: string, user: any, body: {
        rules: any[];
    }): Promise<{
        created: number;
    }>;
}
