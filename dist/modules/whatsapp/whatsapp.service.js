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
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const axios_1 = require("axios");
const crypto = require("crypto");
const META_API_BASE = 'https://graph.facebook.com/v19.0';
let WhatsappService = WhatsappService_1 = class WhatsappService {
    constructor(prisma, whatsappQueue) {
        this.prisma = prisma;
        this.whatsappQueue = whatsappQueue;
        this.logger = new common_1.Logger(WhatsappService_1.name);
    }
    verifyWebhook(mode, token, challenge) {
        const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
        if (mode === 'subscribe' && token === verifyToken) {
            this.logger.log('Webhook verified successfully');
            return challenge;
        }
        throw new common_1.BadRequestException('Webhook verification failed');
    }
    async handleWebhook(payload, signature) {
        if (!this.verifySignature(payload, signature)) {
            this.logger.warn('Invalid webhook signature');
            throw new common_1.BadRequestException('Invalid signature');
        }
        const entries = payload.entry || [];
        for (const entry of entries) {
            const changes = entry.changes || [];
            for (const change of changes) {
                if (change.field === 'messages') {
                    const value = change.value;
                    const phoneNumberId = value.metadata?.phone_number_id;
                    if (!phoneNumberId) {
                        this.logger.warn('Webhook missing phoneNumberId');
                        continue;
                    }
                    const messages = value.messages || [];
                    for (const message of messages) {
                        await this.enqueueMessage(phoneNumberId, message, value.contacts?.[0]);
                    }
                    const statuses = value.statuses || [];
                    for (const status of statuses) {
                        await this.processStatusUpdate(phoneNumberId, status);
                    }
                }
            }
        }
    }
    verifySignature(payload, signature) {
        const appSecret = process.env.META_APP_SECRET;
        if (!appSecret) {
            this.logger.warn('META_APP_SECRET not configured - skipping signature verification');
            return true;
        }
        const expectedSignature = crypto
            .createHmac('sha256', appSecret)
            .update(JSON.stringify(payload))
            .digest('hex');
        const providedSignature = signature?.replace('sha256=', '') || '';
        return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature));
    }
    async enqueueMessage(phoneNumberId, message, contact) {
        await this.whatsappQueue.add('process-message', {
            phoneNumberId,
            message,
            contact,
            receivedAt: new Date().toISOString(),
        }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });
    }
    async processStatusUpdate(phoneNumberId, status) {
        const metaMessageId = status.id;
        const newStatus = status.status;
        try {
            await this.prisma.message.updateMany({
                where: { metaMessageId },
                data: {
                    status: newStatus.toUpperCase(),
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to update message status: ${error.message}`);
        }
    }
    async getUserByPhoneNumberId(phoneNumberId) {
        const user = await this.prisma.user.findFirst({
            where: { phoneNumberId },
            include: {
                company: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`No user found for phoneNumberId: ${phoneNumberId}`);
        }
        return user;
    }
    async sendTextMessage(phoneNumberId, accessToken, to, text) {
        const url = `${META_API_BASE}/${phoneNumberId}/messages`;
        const response = await axios_1.default.post(url, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'text',
            text: { body: text },
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    async sendImageMessage(phoneNumberId, accessToken, to, imageUrl, caption) {
        const url = `${META_API_BASE}/${phoneNumberId}/messages`;
        const response = await axios_1.default.post(url, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'image',
            image: {
                link: imageUrl,
                caption,
            },
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    async sendDocumentMessage(phoneNumberId, accessToken, to, documentUrl, filename, caption) {
        const url = `${META_API_BASE}/${phoneNumberId}/messages`;
        const response = await axios_1.default.post(url, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'document',
            document: {
                link: documentUrl,
                filename,
                caption,
            },
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    async sendTemplateMessage(phoneNumberId, accessToken, to, templateName, languageCode, components) {
        const url = `${META_API_BASE}/${phoneNumberId}/messages`;
        const response = await axios_1.default.post(url, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'template',
            template: {
                name: templateName,
                language: { code: languageCode },
                components,
            },
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    async sendInteractiveButtons(phoneNumberId, accessToken, to, bodyText, buttons, headerText, footerText) {
        const url = `${META_API_BASE}/${phoneNumberId}/messages`;
        const interactive = {
            type: 'button',
            body: { text: bodyText },
            action: {
                buttons: buttons.map(btn => ({
                    type: 'reply',
                    reply: { id: btn.id, title: btn.title },
                })),
            },
        };
        if (headerText)
            interactive.header = { type: 'text', text: headerText };
        if (footerText)
            interactive.footer = { text: footerText };
        const response = await axios_1.default.post(url, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'interactive',
            interactive,
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    async getMediaUrl(mediaId, accessToken) {
        const response = await axios_1.default.get(`${META_API_BASE}/${mediaId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data.url;
    }
    async downloadMedia(mediaUrl, accessToken) {
        const response = await axios_1.default.get(mediaUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
            responseType: 'arraybuffer',
        });
        return Buffer.from(response.data);
    }
    async handleEmbeddedSignupCallback(userId, code) {
        const tokenResponse = await axios_1.default.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
            params: {
                client_id: process.env.META_APP_ID,
                client_secret: process.env.META_APP_SECRET,
                code,
            },
        });
        const accessToken = tokenResponse.data.access_token;
        const wabaResponse = await axios_1.default.get(`https://graph.facebook.com/v19.0/debug_token`, {
            params: {
                input_token: accessToken,
                access_token: `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`,
            },
        });
        const granularScopes = wabaResponse.data.data?.granular_scopes || [];
        const wabaScope = granularScopes.find((s) => s.scope === 'whatsapp_business_management');
        if (!wabaScope?.target_ids?.length) {
            throw new common_1.BadRequestException('No WhatsApp Business Account found');
        }
        const wabaId = wabaScope.target_ids[0];
        const phonesResponse = await axios_1.default.get(`${META_API_BASE}/${wabaId}/phone_numbers`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const phoneNumbers = phonesResponse.data.data || [];
        if (!phoneNumbers.length) {
            throw new common_1.BadRequestException('No phone numbers found in WhatsApp Business Account');
        }
        const primaryPhone = phoneNumbers[0];
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                wabaId,
                phoneNumberId: primaryPhone.id,
                waAccessToken: accessToken,
                waPhone: primaryPhone.display_phone_number,
                waConnectedAt: new Date(),
            },
        });
        return {
            success: true,
            wabaId,
            phoneNumberId: primaryPhone.id,
            phoneNumber: primaryPhone.display_phone_number,
        };
    }
    async disconnectWhatsApp(userId, companyId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, companyId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                wabaId: null,
                phoneNumberId: null,
                waAccessToken: null,
                waPhone: null,
                waConnectedAt: null,
            },
        });
    }
    async getWhatsAppStatus(userId, companyId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, companyId },
            select: {
                phoneNumberId: true,
                waPhone: true,
                waConnectedAt: true,
                wabaId: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            connected: !!user.phoneNumberId,
            phoneNumber: user.waPhone,
            connectedAt: user.waConnectedAt,
            wabaId: user.wabaId,
        };
    }
    async getMessageTemplates(wabaId, accessToken) {
        const response = await axios_1.default.get(`${META_API_BASE}/${wabaId}/message_templates`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data.data || [];
    }
    async createMessageTemplate(wabaId, accessToken, template) {
        const response = await axios_1.default.post(`${META_API_BASE}/${wabaId}/message_templates`, template, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('whatsapp')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map