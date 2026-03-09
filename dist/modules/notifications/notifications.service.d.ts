import { PrismaService } from '../../common/prisma/prisma.service';
export type NotificationType = 'NEW_LEAD' | 'LEAD_STAGE_CHANGED' | 'TASK_DUE_TODAY' | 'CONTRACT_SIGNED';
export declare class NotificationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createNotification(userId: string, companyId: string, type: NotificationType, title: string, body: string, data?: Record<string, unknown>): Promise<any>;
    private sendPushNotification;
    findAll(userId: string, limit?: number): Promise<any>;
    getUnreadCount(userId: string): Promise<{
        count: any;
    }>;
    markAsRead(id: string, userId: string): Promise<any>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
    }>;
    savePushSubscription(userId: string, subscription: Record<string, unknown>): Promise<{
        success: boolean;
    }>;
}
