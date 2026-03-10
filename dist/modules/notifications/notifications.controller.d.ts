import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(user: any, limit?: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        type: string;
        title: string;
        body: string;
        read: boolean;
    }[]>;
    getUnreadCount(user: any): Promise<{
        count: number;
    }>;
    markAllAsRead(user: any): Promise<{
        success: boolean;
    }>;
    markAsRead(id: string, user: any): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        type: string;
        title: string;
        body: string;
        read: boolean;
    }>;
    subscribe(user: any, body: {
        subscription: Record<string, unknown>;
    }): Promise<{
        success: boolean;
    }>;
}
