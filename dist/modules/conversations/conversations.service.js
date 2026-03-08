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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let ConversationsService = class ConversationsService {
    constructor(prisma, whatsappService) {
        this.prisma = prisma;
        this.whatsappService = whatsappService;
    }
    async findAll(companyId, filters) {
        const where = { companyId };
        if (filters.userId)
            where.userId = filters.userId;
        if (filters.hasUnread)
            where.unreadCount = { gt: 0 };
        if (filters.isBotActive !== undefined)
            where.isBotActive = filters.isBotActive;
        if (filters.search) {
            where.OR = [
                { phone: { contains: filters.search } },
                { lead: { name: { contains: filters.search, mode: 'insensitive' } } },
            ];
        }
        return this.prisma.conversation.findMany({
            where,
            include: {
                lead: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        temperature: true,
                        stage: { select: { name: true, color: true } },
                    },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { lastMessageAt: 'desc' },
        });
    }
    async findOne(id, companyId) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id, companyId },
            include: {
                lead: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                        temperature: true,
                        priority: true,
                        tags: true,
                        stage: { select: { name: true, color: true } },
                        pipeline: { select: { name: true } },
                    },
                },
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
                aiSuggestions: {
                    where: { used: false },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversa não encontrada');
        }
        return conversation;
    }
    async findByPhone(companyId, phone) {
        return this.prisma.conversation.findFirst({
            where: { companyId, phone },
            include: {
                lead: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async findByLead(companyId, leadId) {
        return this.prisma.conversation.findFirst({
            where: { companyId, leadId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }
    async getMessages(conversationId, companyId, page = 1, limit = 50) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, companyId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversa não encontrada');
        }
        const skip = (page - 1) * limit;
        const [messages, total] = await Promise.all([
            this.prisma.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.message.count({ where: { conversationId } }),
        ]);
        return {
            data: messages.reverse(),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async sendMessage(conversationId, companyId, userId, dto) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, companyId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversa não encontrada');
        }
        const user = await this.prisma.user.findFirst({
            where: { id: userId },
            select: {
                phoneNumberId: true,
                waAccessToken: true,
            },
        });
        if (!user?.phoneNumberId || !user?.waAccessToken) {
            throw new common_1.NotFoundException('WhatsApp não configurado');
        }
        let sendResult;
        try {
            switch (dto.type) {
                case 'text':
                    sendResult = await this.whatsappService.sendTextMessage(user.phoneNumberId, user.waAccessToken, conversation.phone, dto.content);
                    break;
                case 'image':
                    sendResult = await this.whatsappService.sendImageMessage(user.phoneNumberId, user.waAccessToken, conversation.phone, dto.mediaUrl, dto.content);
                    break;
                case 'document':
                    sendResult = await this.whatsappService.sendDocumentMessage(user.phoneNumberId, user.waAccessToken, conversation.phone, dto.mediaUrl, dto.filename || 'documento', dto.content);
                    break;
                case 'template':
                    sendResult = await this.whatsappService.sendTemplateMessage(user.phoneNumberId, user.waAccessToken, conversation.phone, dto.templateName, dto.languageCode || 'pt_BR', dto.templateComponents);
                    break;
            }
        }
        catch (error) {
            const message = await this.prisma.message.create({
                data: {
                    conversationId,
                    content: dto.content,
                    type: dto.type.toUpperCase(),
                    direction: 'OUTBOUND',
                    sender: 'HUMAN_AGENT',
                    status: 'FAILED',
                    mediaUrl: dto.mediaUrl,
                },
            });
            return { message, error: error.message };
        }
        const message = await this.prisma.message.create({
            data: {
                conversationId,
                content: dto.content,
                type: dto.type.toUpperCase(),
                direction: 'OUTBOUND',
                sender: 'HUMAN_AGENT',
                status: 'SENT',
                mediaUrl: dto.mediaUrl,
                metaMessageId: sendResult.messages?.[0]?.id,
            },
        });
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessage: dto.content.substring(0, 100),
                lastMessageAt: new Date(),
            },
        });
        await this.prisma.lead.update({
            where: { id: conversation.leadId },
            data: { lastInteraction: new Date() },
        });
        return message;
    }
    async toggleBot(conversationId, companyId, isActive) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, companyId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversa não encontrada');
        }
        return this.prisma.conversation.update({
            where: { id: conversationId },
            data: { isBotActive: isActive },
        });
    }
    async toggleCoPilot(conversationId, companyId, isActive) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, companyId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversa não encontrada');
        }
        return this.prisma.conversation.update({
            where: { id: conversationId },
            data: { aiAssistMode: isActive },
        });
    }
    async assumeConversation(conversationId, companyId) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, companyId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversa não encontrada');
        }
        return this.prisma.conversation.update({
            where: { id: conversationId },
            data: {
                isBotActive: false,
                aiAssistMode: true,
            },
        });
    }
    async reactivateBot(conversationId, companyId) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, companyId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversa não encontrada');
        }
        return this.prisma.conversation.update({
            where: { id: conversationId },
            data: {
                isBotActive: true,
                aiAssistMode: false,
            },
        });
    }
    async markAsRead(conversationId, companyId) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, companyId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversa não encontrada');
        }
        return this.prisma.conversation.update({
            where: { id: conversationId },
            data: { unreadCount: 0 },
        });
    }
    async markAsUnread(conversationId, companyId) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, companyId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversa não encontrada');
        }
        return this.prisma.conversation.update({
            where: { id: conversationId },
            data: { unreadCount: 1 },
        });
    }
    async useSuggestion(suggestionId, companyId, edited = false) {
        const suggestion = await this.prisma.aiSuggestion.findFirst({
            where: { id: suggestionId },
            include: { conversation: true },
        });
        if (!suggestion || suggestion.conversation.companyId !== companyId) {
            throw new common_1.NotFoundException('Sugestão não encontrada');
        }
        return this.prisma.aiSuggestion.update({
            where: { id: suggestionId },
            data: {
                used: true,
                usedAt: new Date(),
                editedBeforeSend: edited,
            },
        });
    }
    async dismissSuggestion(suggestionId, companyId) {
        const suggestion = await this.prisma.aiSuggestion.findFirst({
            where: { id: suggestionId },
            include: { conversation: true },
        });
        if (!suggestion || suggestion.conversation.companyId !== companyId) {
            throw new common_1.NotFoundException('Sugestão não encontrada');
        }
        return this.prisma.aiSuggestion.delete({
            where: { id: suggestionId },
        });
    }
    async getSuggestions(conversationId, companyId) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, companyId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversa não encontrada');
        }
        return this.prisma.aiSuggestion.findMany({
            where: { conversationId, used: false },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getStats(companyId, userId) {
        const where = { companyId };
        if (userId)
            where.userId = userId;
        const [total, unread, botActive, humanActive] = await Promise.all([
            this.prisma.conversation.count({ where }),
            this.prisma.conversation.count({ where: { ...where, unreadCount: { gt: 0 } } }),
            this.prisma.conversation.count({ where: { ...where, isBotActive: true } }),
            this.prisma.conversation.count({ where: { ...where, isBotActive: false } }),
        ]);
        return { total, unread, botActive, humanActive };
    }
};
exports.ConversationsService = ConversationsService;
exports.ConversationsService = ConversationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => whatsapp_service_1.WhatsappService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService])
], ConversationsService);
//# sourceMappingURL=conversations.service.js.map