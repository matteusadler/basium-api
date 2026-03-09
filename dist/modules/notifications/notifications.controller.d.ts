import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(user: any, limit?: string): Promise<any>;
    getUnreadCount(user: any): Promise<{
        count: any;
    }>;
    markAllAsRead(user: any): Promise<{
        success: boolean;
    }>;
    markAsRead(id: string, user: any): Promise<any>;
    subscribe(user: any, body: {
        subscription: Record<string, unknown>;
    }): Promise<{
        success: boolean;
    }>;
}
