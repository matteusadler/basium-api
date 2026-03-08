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
var FlowMessageProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowMessageProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const axios_1 = require("axios");
let FlowMessageProcessor = FlowMessageProcessor_1 = class FlowMessageProcessor extends bullmq_1.WorkerHost {
    constructor(prisma) {
        super();
        this.prisma = prisma;
        this.logger = new common_1.Logger(FlowMessageProcessor_1.name);
    }
    async process(job) {
        const { executionId, phone, type, content, mediaUrl, companyId } = job.data;
        this.logger.log(`Sending message to ${phone} for execution ${executionId}`);
        try {
            const execution = await this.prisma.flowExecution.findUnique({
                where: { id: executionId },
                include: {
                    lead: {
                        include: {
                            company: true,
                        },
                    },
                },
            });
            if (!execution) {
                throw new Error('Execution not found');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: execution.lead.userId },
            });
            if (!user?.phoneNumberId || !user?.waAccessToken) {
                this.logger.warn(`User ${execution.lead.userId} has no WhatsApp configuration`);
                return {
                    status: 'skipped',
                    reason: 'no_whatsapp_config',
                    phone,
                };
            }
            const result = await this.sendWhatsAppMessage(user.phoneNumberId, user.waAccessToken, phone, type, content, mediaUrl);
            const conversation = await this.prisma.conversation.findFirst({
                where: {
                    leadId: execution.leadId,
                    phone,
                },
            });
            if (conversation) {
                await this.prisma.message.create({
                    data: {
                        conversationId: conversation.id,
                        content,
                        type: type.toLowerCase(),
                        direction: 'OUTBOUND',
                        sender: 'FLOW',
                        status: 'SENT',
                        mediaUrl,
                        metaMessageId: result.messageId,
                    },
                });
                await this.prisma.conversation.update({
                    where: { id: conversation.id },
                    data: {
                        lastMessage: content.substring(0, 100),
                        lastMessageAt: new Date(),
                    },
                });
            }
            this.logger.log(`Message sent successfully to ${phone}`);
            return {
                status: 'sent',
                phone,
                messageId: result.messageId,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send message: ${error.message}`);
            return {
                status: 'failed',
                phone,
                error: error.message,
            };
        }
    }
    async sendWhatsAppMessage(phoneNumberId, accessToken, to, type, content, mediaUrl) {
        const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
        const formattedPhone = to.replace(/\D/g, '');
        let payload = {
            messaging_product: 'whatsapp',
            to: formattedPhone,
        };
        switch (type.toUpperCase()) {
            case 'TEXT':
                payload.type = 'text';
                payload.text = { body: content };
                break;
            case 'IMAGE':
                payload.type = 'image';
                payload.image = {
                    link: mediaUrl,
                    caption: content || undefined,
                };
                break;
            case 'DOCUMENT':
                payload.type = 'document';
                payload.document = {
                    link: mediaUrl,
                    caption: content || undefined,
                };
                break;
            case 'VIDEO':
                payload.type = 'video';
                payload.video = {
                    link: mediaUrl,
                    caption: content || undefined,
                };
                break;
            case 'AUDIO':
                payload.type = 'audio';
                payload.audio = { link: mediaUrl };
                break;
            default:
                payload.type = 'text';
                payload.text = { body: content };
        }
        try {
            const response = await axios_1.default.post(url, payload, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return {
                messageId: response.data.messages?.[0]?.id || 'unknown',
            };
        }
        catch (error) {
            this.logger.error(`WhatsApp API error: ${error.response?.data?.error?.message || error.message}`);
            throw new Error(error.response?.data?.error?.message || 'Failed to send WhatsApp message');
        }
    }
    onCompleted(job) {
        this.logger.debug(`Message job ${job.id} completed`);
    }
    onFailed(job, error) {
        this.logger.error(`Message job ${job.id} failed: ${error.message}`);
    }
};
exports.FlowMessageProcessor = FlowMessageProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], FlowMessageProcessor.prototype, "onCompleted", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", void 0)
], FlowMessageProcessor.prototype, "onFailed", null);
exports.FlowMessageProcessor = FlowMessageProcessor = FlowMessageProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('flow-message', { connection: { host: 'localhost', port: 6379 } }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FlowMessageProcessor);
//# sourceMappingURL=flow-message.processor.js.map