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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const notifications_service_1 = require("./notifications.service");
let NotificationsScheduler = class NotificationsScheduler {
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async notifyTasksDueToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tasks = await this.prisma.task.findMany({
            where: {
                status: 'PENDING',
                dueDate: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            select: { id: true, title: true, userId: true, companyId: true },
        });
        for (const task of tasks) {
            if (task.userId) {
                this.notifications
                    .createNotification(task.userId, task.companyId, 'TASK_DUE_TODAY', 'Tarefa vence hoje', task.title || 'Uma tarefa pendente vence hoje', { taskId: task.id })
                    .catch(() => { });
            }
        }
    }
};
exports.NotificationsScheduler = NotificationsScheduler;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsScheduler.prototype, "notifyTasksDueToday", null);
exports.NotificationsScheduler = NotificationsScheduler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], NotificationsScheduler);
//# sourceMappingURL=notifications.scheduler.js.map