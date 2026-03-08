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
exports.ConversationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const conversations_service_1 = require("./conversations.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const conversation_filters_dto_1 = require("./dto/conversation-filters.dto");
const send_message_dto_1 = require("./dto/send-message.dto");
let ConversationsController = class ConversationsController {
    constructor(conversationsService) {
        this.conversationsService = conversationsService;
    }
    async findAll(user, filters) {
        return this.conversationsService.findAll(user.companyId, filters);
    }
    async getStats(user, userId) {
        return this.conversationsService.getStats(user.companyId, userId);
    }
    async findByPhone(phone, user) {
        return this.conversationsService.findByPhone(user.companyId, phone);
    }
    async findByLead(leadId, user) {
        return this.conversationsService.findByLead(user.companyId, leadId);
    }
    async findOne(id, user) {
        return this.conversationsService.findOne(id, user.companyId);
    }
    async getMessages(id, user, page, limit) {
        return this.conversationsService.getMessages(id, user.companyId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
    }
    async sendMessage(id, user, dto) {
        return this.conversationsService.sendMessage(id, user.companyId, user.sub, dto);
    }
    async toggleBot(id, user, body) {
        return this.conversationsService.toggleBot(id, user.companyId, body.isActive);
    }
    async toggleCoPilot(id, user, body) {
        return this.conversationsService.toggleCoPilot(id, user.companyId, body.isActive);
    }
    async assumeConversation(id, user) {
        return this.conversationsService.assumeConversation(id, user.companyId);
    }
    async reactivateBot(id, user) {
        return this.conversationsService.reactivateBot(id, user.companyId);
    }
    async markAsRead(id, user) {
        return this.conversationsService.markAsRead(id, user.companyId);
    }
    async markAsUnread(id, user) {
        return this.conversationsService.markAsUnread(id, user.companyId);
    }
    async getSuggestions(id, user) {
        return this.conversationsService.getSuggestions(id, user.companyId);
    }
    async useSuggestion(suggestionId, user, body) {
        return this.conversationsService.useSuggestion(suggestionId, user.companyId, body.edited);
    }
    async dismissSuggestion(suggestionId, user) {
        return this.conversationsService.dismissSuggestion(suggestionId, user.companyId);
    }
};
exports.ConversationsController = ConversationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all conversations' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, conversation_filters_dto_1.ConversationFiltersDto]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get conversation statistics' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('by-phone/:phone'),
    (0, swagger_1.ApiOperation)({ summary: 'Get conversation by phone number' }),
    __param(0, (0, common_1.Param)('phone')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "findByPhone", null);
__decorate([
    (0, common_1.Get)('by-lead/:leadId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get conversation by lead ID' }),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "findByLead", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get conversation with messages' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get messages for conversation (paginated)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Send message in conversation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Put)(':id/toggle-bot'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle AI bot active status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "toggleBot", null);
__decorate([
    (0, common_1.Put)(':id/toggle-copilot'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle Co-Pilot assist mode' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "toggleCoPilot", null);
__decorate([
    (0, common_1.Put)(':id/assume'),
    (0, swagger_1.ApiOperation)({ summary: 'Assume conversation (disable bot, enable co-pilot)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "assumeConversation", null);
__decorate([
    (0, common_1.Put)(':id/reactivate-bot'),
    (0, swagger_1.ApiOperation)({ summary: 'Reactivate AI bot' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "reactivateBot", null);
__decorate([
    (0, common_1.Put)(':id/mark-read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark conversation as read' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Put)(':id/mark-unread'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark conversation as unread' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "markAsUnread", null);
__decorate([
    (0, common_1.Get)(':id/suggestions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI suggestions for conversation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "getSuggestions", null);
__decorate([
    (0, common_1.Put)('suggestions/:suggestionId/use'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark suggestion as used' }),
    __param(0, (0, common_1.Param)('suggestionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "useSuggestion", null);
__decorate([
    (0, common_1.Delete)('suggestions/:suggestionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Dismiss/delete suggestion' }),
    __param(0, (0, common_1.Param)('suggestionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "dismissSuggestion", null);
exports.ConversationsController = ConversationsController = __decorate([
    (0, swagger_1.ApiTags)('conversations'),
    (0, common_1.Controller)('conversations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [conversations_service_1.ConversationsService])
], ConversationsController);
//# sourceMappingURL=conversations.controller.js.map