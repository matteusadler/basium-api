import { ContractsService } from './contracts.service';
export declare class ContractsController {
    private contractsService;
    constructor(contractsService: ContractsService);
    findAll(user: any, filters: any): Promise<any>;
    getStats(user: any): Promise<{
        total: any;
        active: any;
        pending: any;
        completed: any;
        totalSaleValue: any;
        totalRentValue: any;
    }>;
    findOne(id: string, user: any): Promise<any>;
    create(user: any, dto: any): Promise<any>;
    update(id: string, user: any, dto: any): Promise<any>;
    delete(id: string, user: any): Promise<any>;
    addDocument(id: string, user: any, docData: any): Promise<any>;
    generateRentalEntries(id: string, user: any): Promise<{
        created: number;
    }>;
}
