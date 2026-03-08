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
exports.WhatsappController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const whatsapp_service_1 = require("./whatsapp.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const send_message_dto_1 = require("./dto/send-message.dto");
let WhatsappController = class WhatsappController {
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
    }
    verifyWebhook(mode, token, challenge) {
        return this.whatsappService.verifyWebhook(mode, token, challenge);
    }
    async handleWebhook(body, signature) {
        await this.whatsappService.handleWebhook(body, signature);
        return { status: 'ok' };
    }
    async getStatus(user) {
        return this.whatsappService.getWhatsAppStatus(user.sub, user.companyId);
    }
    async handleEmbeddedSignupCallback(user, body) {
        return this.whatsappService.handleEmbeddedSignupCallback(user.sub, body.code);
    }
    async disconnect(user) {
        await this.whatsappService.disconnectWhatsApp(user.sub, user.companyId);
        return { success: true };
    }
    async sendMessage(user, dto) {
        const userData = await this.whatsappService.getUserByPhoneNumberId(user.phoneNumberId);
        if (!userData.phoneNumberId || !userData.waAccessToken) {
            return { error: 'WhatsApp not connected' };
        }
        let result;
        switch (dto.type) {
            case 'text':
                result = await this.whatsappService.sendTextMessage(userData.phoneNumberId, userData.waAccessToken, dto.to, dto.text);
                break;
            case 'image':
                result = await this.whatsappService.sendImageMessage(userData.phoneNumberId, userData.waAccessToken, dto.to, dto.mediaUrl, dto.caption);
                break;
            case 'document':
                result = await this.whatsappService.sendDocumentMessage(userData.phoneNumberId, userData.waAccessToken, dto.to, dto.mediaUrl, dto.filename, dto.caption);
                break;
            case 'template':
                result = await this.whatsappService.sendTemplateMessage(userData.phoneNumberId, userData.waAccessToken, dto.to, dto.templateName, dto.languageCode || 'pt_BR', dto.templateComponents);
                break;
            default:
                return { error: 'Invalid message type' };
        }
        return result;
    }
    async getTemplates(user) {
        const userData = await this.whatsappService.getUserByPhoneNumberId(user.phoneNumberId);
        if (!userData.wabaId || !userData.waAccessToken) {
            return { templates: [], error: 'WhatsApp not connected' };
        }
        const templates = await this.whatsappService.getMessageTemplates(userData.wabaId, userData.waAccessToken);
        return { templates };
    }
};
exports.WhatsappController = WhatsappController;
__decorate([
    (0, common_1.Get)('webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Meta webhook verification (GET)' }),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", String)
], WhatsappController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Meta webhook receiver (POST)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-hub-signature-256')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get WhatsApp connection status' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('connect/callback'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Embedded Signup callback' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "handleEmbeddedSignupCallback", null);
__decorate([
    (0, common_1.Post)('disconnect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect WhatsApp' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "disconnect", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Send WhatsApp message' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get WhatsApp message templates' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "getTemplates", null);
exports.WhatsappController = WhatsappController = __decorate([
    (0, swagger_1.ApiTags)('whatsapp'),
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService])
], WhatsappController);
//# sourceMappingURL=whatsapp.controller.js.map