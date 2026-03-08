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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const leads_service_1 = require("./leads.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const create_lead_dto_1 = require("./dto/create-lead.dto");
const update_lead_dto_1 = require("./dto/update-lead.dto");
const lead_filters_dto_1 = require("./dto/lead-filters.dto");
const move_stage_dto_1 = require("./dto/move-stage.dto");
const mark_lost_dto_1 = require("./dto/mark-lost.dto");
const mark_won_dto_1 = require("./dto/mark-won.dto");
const create_note_dto_1 = require("./dto/create-note.dto");
let LeadsController = class LeadsController {
    constructor(leadsService) {
        this.leadsService = leadsService;
    }
    async findAll(user, filters) {
        return this.leadsService.findAll(user.companyId, filters);
    }
    async findByStage(pipelineId, user) {
        return this.leadsService.findByStage(user.companyId, pipelineId);
    }
    async getStats(user, userId) {
        return this.leadsService.getStats(user.companyId, userId);
    }
    async checkDuplicates(user, phone, email) {
        return this.leadsService.checkDuplicates(user.companyId, phone, email);
    }
    async findOne(id, user) {
        return this.leadsService.findOne(id, user.companyId);
    }
    async getTimeline(id, user) {
        return this.leadsService.getTimeline(id, user.companyId);
    }
    async create(user, dto) {
        return this.leadsService.create(user.companyId, user.id, dto);
    }
    async update(id, user, dto) {
        return this.leadsService.update(id, user.companyId, user.id, dto);
    }
    async delete(id, user) {
        return this.leadsService.delete(id, user.companyId, user.id);
    }
    async moveStage(id, user, dto) {
        return this.leadsService.moveStage(id, user.companyId, user.id, dto);
    }
    async markAsWon(id, user, dto) {
        return this.leadsService.markAsWon(id, user.companyId, user.id, dto);
    }
    async markAsLost(id, user, dto) {
        return this.leadsService.markAsLost(id, user.companyId, user.id, dto);
    }
    async reactivate(id, user) {
        return this.leadsService.reactivate(id, user.companyId, user.id);
    }
    async toggleFavorite(id, user) {
        return this.leadsService.toggleFavorite(id, user.companyId);
    }
    async addNote(id, user, dto) {
        return this.leadsService.addNote(id, user.companyId, user.id, dto);
    }
    async updateNote(noteId, user, body) {
        return this.leadsService.updateNote(noteId, user.companyId, user.id, body.content);
    }
    async togglePinNote(noteId, user) {
        return this.leadsService.togglePinNote(noteId, user.companyId);
    }
    async deleteNote(noteId, user) {
        return this.leadsService.deleteNote(noteId, user.companyId, user.id);
    }
    async addAttachment(id, user, fileData) {
        return this.leadsService.addAttachment(id, user.companyId, user.id, fileData);
    }
    async deleteAttachment(attachmentId, user) {
        return this.leadsService.deleteAttachment(attachmentId, user.companyId, user.id);
    }
    async bulkMoveStage(user, body) {
        return this.leadsService.bulkUpdateStage(user.companyId, user.id, body.leadIds, body.stageId);
    }
    async bulkAssign(user, body) {
        return this.leadsService.bulkAssign(user.companyId, user.id, body.leadIds, body.userId);
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List leads with filters' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, lead_filters_dto_1.LeadFiltersDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('kanban/:pipelineId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get leads grouped by stage for Kanban view' }),
    __param(0, (0, common_1.Param)('pipelineId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findByStage", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get lead statistics' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('check-duplicate'),
    (0, swagger_1.ApiOperation)({ summary: 'Check for duplicate leads by phone/email' }),
    (0, swagger_1.ApiQuery)({ name: 'phone', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'email', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('phone')),
    __param(2, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "checkDuplicates", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get lead by ID with full details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/timeline'),
    (0, swagger_1.ApiOperation)({ summary: 'Get lead timeline/history' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getTimeline", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new lead' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_lead_dto_1.CreateLeadDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update lead' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_lead_dto_1.UpdateLeadDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Archive lead' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "delete", null);
__decorate([
    (0, common_1.Put)(':id/move-stage'),
    (0, swagger_1.ApiOperation)({ summary: 'Move lead to different stage' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, move_stage_dto_1.MoveStageDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "moveStage", null);
__decorate([
    (0, common_1.Put)(':id/mark-won'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark lead as won' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, mark_won_dto_1.MarkWonDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "markAsWon", null);
__decorate([
    (0, common_1.Put)(':id/mark-lost'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark lead as lost' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, mark_lost_dto_1.MarkLostDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "markAsLost", null);
__decorate([
    (0, common_1.Put)(':id/reactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Reactivate archived/lost lead' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Put)(':id/toggle-favorite'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle lead favorite status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "toggleFavorite", null);
__decorate([
    (0, common_1.Post)(':id/notes'),
    (0, swagger_1.ApiOperation)({ summary: 'Add note to lead' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_note_dto_1.CreateNoteDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "addNote", null);
__decorate([
    (0, common_1.Put)('notes/:noteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update note' }),
    __param(0, (0, common_1.Param)('noteId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "updateNote", null);
__decorate([
    (0, common_1.Put)('notes/:noteId/toggle-pin'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle note pin status' }),
    __param(0, (0, common_1.Param)('noteId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "togglePinNote", null);
__decorate([
    (0, common_1.Delete)('notes/:noteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete note' }),
    __param(0, (0, common_1.Param)('noteId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "deleteNote", null);
__decorate([
    (0, common_1.Post)(':id/attachments'),
    (0, swagger_1.ApiOperation)({ summary: 'Add attachment to lead' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "addAttachment", null);
__decorate([
    (0, common_1.Delete)('attachments/:attachmentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete attachment' }),
    __param(0, (0, common_1.Param)('attachmentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "deleteAttachment", null);
__decorate([
    (0, common_1.Post)('bulk/move-stage'),
    (0, swagger_1.ApiOperation)({ summary: 'Move multiple leads to a stage' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "bulkMoveStage", null);
__decorate([
    (0, common_1.Post)('bulk/assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign multiple leads to a user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "bulkAssign", null);
exports.LeadsController = LeadsController = __decorate([
    (0, swagger_1.ApiTags)('leads'),
    (0, common_1.Controller)('leads'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [leads_service_1.LeadsService])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map