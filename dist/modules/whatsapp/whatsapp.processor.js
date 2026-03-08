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
var WhatsappProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const whatsapp_service_1 = require("./whatsapp.service");
const conversations_service_1 = require("../conversations/conversations.service");
const leads_service_1 = require("../leads/leads.service");
const ai_service_1 = require("../ai/ai.service");
let WhatsappProcessor = WhatsappProcessor_1 = class WhatsappProcessor extends bullmq_1.WorkerHost {
    constructor(prisma, whatsappService, conversationsService, leadsService, aiService) {
        super();
        this.prisma = prisma;
        this.whatsappService = whatsappService;
        this.conversationsService = conversationsService;
        this.leadsService = leadsService;
        this.aiService = aiService;
        this.logger = new common_1.Logger(WhatsappProcessor_1.name);
    }
    async process(job) {
        const { name, data } = job;
        switch (name) {
            case 'process-message':
                return this.processIncomingMessage(data);
            default:
                this.logger.warn(`Unknown job type: ${name}`);
        }
    }
    async processIncomingMessage(data) {
        const { phoneNumberId, message, contact } = data;
        try {
            const user = await this.whatsappService.getUserByPhoneNumberId(phoneNumberId);
            const companyId = user.companyId;
            const messageContent = this.extractMessageContent(message);
            const senderPhone = message.from;
            const senderName = contact?.profile?.name || senderPhone;
            let lead = await this.prisma.lead.findFirst({
                where: { companyId, phone: senderPhone },
            });
            if (!lead) {
                const defaultPipeline = await this.prisma.pipeline.findFirst({
                    where: { companyId, isDefault: true },
                    include: { stages: { orderBy: { order: 'asc' }, take: 1 } },
                });
                if (defaultPipeline && defaultPipeline.stages[0]) {
                    lead = await this.prisma.lead.create({
                        data: {
                            companyId,
                            userId: user.id,
                            name: senderName,
                            phone: senderPhone,
                            origin: 'WHATSAPP',
                            temperature: 'WARM',
                            pipelineId: defaultPipeline.id,
                            stageId: defaultPipeline.stages[0].id,
                        },
                    });
                    await this.prisma.leadHistory.create({
                        data: {
                            leadId: lead.id,
                            userId: user.id,
                            event: 'LEAD_CREATED',
                            metadata: { origin: 'WHATSAPP', autoCreated: true },
                        },
                    });
                }
            }
            if (!lead) {
                this.logger.error('Could not find or create lead');
                return;
            }
            let conversation = await this.prisma.conversation.findFirst({
                where: { companyId, phone: senderPhone },
            });
            if (!conversation) {
                conversation = await this.prisma.conversation.create({
                    data: {
                        companyId,
                        leadId: lead.id,
                        userId: user.id,
                        phone: senderPhone,
                        isBotActive: user.aiEnabled,
                        aiAssistMode: false,
                    },
                });
            }
            const savedMessage = await this.prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    content: messageContent.text,
                    type: messageContent.type,
                    direction: 'INBOUND',
                    sender: 'USER',
                    mediaUrl: messageContent.mediaUrl,
                },
            });
            await this.prisma.conversation.update({
                where: { id: conversation.id },
                data: {
                    lastMessage: messageContent.text.substring(0, 100),
                    lastMessageAt: new Date(),
                    unreadCount: { increment: 1 },
                },
            });
            await this.prisma.lead.update({
                where: { id: lead.id },
                data: { lastInteraction: new Date() },
            });
            if (conversation.isBotActive && user.aiEnabled && user.openaiKey) {
                await this.handleAIResponse(user, conversation, lead, messageContent.text);
            }
            if (!conversation.isBotActive && conversation.aiAssistMode && user.openaiKey) {
                await this.generateCoPilotSuggestion(user, conversation, lead, messageContent.text);
            }
        }
        catch (error) {
            this.logger.error(`Error processing message: ${error.message}`, error.stack);
            throw error;
        }
    }
    extractMessageContent(message) {
        if (message.text) {
            return { text: message.text.body, type: 'TEXT' };
        }
        if (message.image) {
            return {
                text: message.image.caption || '[Imagem]',
                type: 'IMAGE',
                mediaUrl: message.image.id,
            };
        }
        if (message.document) {
            return {
                text: message.document.caption || `[Documento: ${message.document.filename}]`,
                type: 'DOCUMENT',
                mediaUrl: message.document.id,
            };
        }
        if (message.audio) {
            return {
                text: '[\u00c1udio]',
                type: 'AUDIO',
                mediaUrl: message.audio.id,
            };
        }
        if (message.video) {
            return {
                text: message.video.caption || '[V\u00eddeo]',
                type: 'VIDEO',
                mediaUrl: message.video.id,
            };
        }
        if (message.location) {
            return {
                text: `[Localiza\u00e7\u00e3o: ${message.location.address || `${message.location.latitude}, ${message.location.longitude}`}]`,
                type: 'LOCATION',
            };
        }
        if (message.button) {
            return { text: message.button.text, type: 'BUTTON' };
        }
        if (message.interactive) {
            const reply = message.interactive.button_reply || message.interactive.list_reply;
            return { text: reply?.title || '[Intera\u00e7\u00e3o]', type: 'INTERACTIVE' };
        }
        return { text: '[Mensagem n\u00e3o suportada]', type: 'UNKNOWN' };
    }
    async handleAIResponse(user, conversation, lead, incomingText) {
        try {
            if (!this.isWithinWorkingHours(user.aiWorkingHours)) {
                this.logger.log('Outside working hours - AI will not respond');
                return;
            }
            if (this.shouldTransferToHuman(incomingText, user.aiTransferKeywords)) {
                await this.prisma.conversation.update({
                    where: { id: conversation.id },
                    data: { isBotActive: false },
                });
                return;
            }
            const history = await this.prisma.message.findMany({
                where: { conversationId: conversation.id },
                orderBy: { createdAt: 'desc' },
                take: 20,
            });
            const aiResponse = await this.aiService.generateResponse(user.id, lead, history.reverse(), incomingText, user.aiSystemPrompt);
            if (aiResponse) {
                const sendResult = await this.whatsappService.sendTextMessage(user.phoneNumberId, user.waAccessToken, conversation.phone, aiResponse);
                await this.prisma.message.create({
                    data: {
                        conversationId: conversation.id,
                        content: aiResponse,
                        type: 'TEXT',
                        direction: 'OUTBOUND',
                        sender: 'AI',
                        status: 'SENT',
                        metaMessageId: sendResult.messages?.[0]?.id,
                    },
                });
                await this.prisma.conversation.update({
                    where: { id: conversation.id },
                    data: {
                        lastMessage: aiResponse.substring(0, 100),
                        lastMessageAt: new Date(),
                    },
                });
            }
        }
        catch (error) {
            this.logger.error(`AI response error: ${error.message}`);
        }
    }
    async generateCoPilotSuggestion(user, conversation, lead, incomingText) {
        try {
            const suggestions = await this.aiService.generateCoPilotSuggestions(user.id, lead, incomingText);
            for (const suggestion of suggestions) {
                await this.prisma.aiSuggestion.create({
                    data: {
                        conversationId: conversation.id,
                        leadId: lead.id,
                        suggestedText: suggestion.text,
                        suggestionType: suggestion.type,
                    },
                });
            }
        }
        catch (error) {
            this.logger.error(`Co-Pilot suggestion error: ${error.message}`);
        }
    }
    isWithinWorkingHours(workingHours) {
        if (!workingHours)
            return true;
        const now = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = days[now.getDay()];
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        const todayHours = workingHours[dayOfWeek];
        if (!todayHours || !todayHours.enabled)
            return false;
        const [startHour, startMin] = todayHours.start.split(':').map(Number);
        const [endHour, endMin] = todayHours.end.split(':').map(Number);
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;
        return currentTime >= startTime && currentTime <= endTime;
    }
    shouldTransferToHuman(text, keywords) {
        if (!keywords || keywords.length === 0)
            return false;
        const lowerText = text.toLowerCase();
        return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
    }
};
exports.WhatsappProcessor = WhatsappProcessor;
exports.WhatsappProcessor = WhatsappProcessor = WhatsappProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('whatsapp'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService,
        conversations_service_1.ConversationsService,
        leads_service_1.LeadsService,
        ai_service_1.AiService])
], WhatsappProcessor);
//# sourceMappingURL=whatsapp.processor.js.map