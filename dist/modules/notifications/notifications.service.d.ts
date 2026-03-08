import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
export type NotificationType = 'NEW_LEAD' | 'LEAD_STAGE_CHANGED' | 'TASK_DUE_TODAY' | 'CONTRACT_SIGNED';
export declare class NotificationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createNotification(userId: string, companyId: string, type: NotificationType, title: string, body: string, data?: Record<string, unknown>): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        data: Prisma.JsonValue | null;
        type: string;
        title: string;
        userId: string;
        body: string;
        read: boolean;
    }>;
    private sendPushNotification;
    findAll(userId: string, limit?: number): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        data: Prisma.JsonValue | null;
        type: string;
        title: string;
        userId: string;
        body: string;
        read: boolean;
    }[]>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAsRead(id: string, userId: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        data: Prisma.JsonValue | null;
        type: string;
        title: string;
        userId: string;
        body: string;
        read: boolean;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
    }>;
    savePushSubscription(userId: string, subscription: Record<string, unknown>): Promise<{
        success: boolean;
    }>;
}
