"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async createNotification(userId, companyId, type, title, body, data) {
        const notification = await this.prisma.notification.create({
            data: {
                userId,
                companyId,
                type,
                title,
                body,
                data: data ? data : undefined,
            },
        });
        await this.sendPushNotification(userId, { title, body, data: notification.data });
        return notification;
    }
    async sendPushNotification(userId, payload) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { pushSubscription: true },
            });
            const sub = user?.pushSubscription;
            if (!sub || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY)
                return;
            let webpush;
            try {
                webpush = require('web-push');
            }
            catch {
                return;
            }
            webpush.setVapidDetails('mailto:support@basium.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
            await webpush.sendNotification(sub, JSON.stringify({
                title: payload.title,
                body: payload.body,
                data: payload.data,
            }));
        }
        catch (err) {
            this.logger.warn(`Push notification failed for user ${userId}: ${err.message}`);
        }
    }
    async findAll(userId, limit = 50) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getUnreadCount(userId) {
        const count = await this.prisma.notification.count({
            where: { userId, read: false },
        });
        return { count };
    }
    async markAsRead(id, userId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notificação não encontrada');
        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId },
            data: { read: true },
        });
        return { success: true };
    }
    async savePushSubscription(userId, subscription) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { pushSubscription: subscription },
        });
        return { success: true };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map