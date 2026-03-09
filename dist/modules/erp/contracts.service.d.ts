import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ContractsService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    findAll(companyId: string, filters?: any): Promise<any>;
    findOne(id: string, companyId: string): Promise<any>;
    create(companyId: string, userId: string, dto: any): Promise<any>;
    update(id: string, companyId: string, dto: any): Promise<any>;
    delete(id: string, companyId: string): Promise<any>;
    addDocument(id: string, companyId: string, docData: any): Promise<any>;
    generateRentalEntries(id: string, companyId: string): Promise<{
        created: number;
    }>;
    getStats(companyId: string): Promise<{
        total: any;
        active: any;
        pending: any;
        completed: any;
        totalSaleValue: any;
        totalRentValue: any;
    }>;
}
