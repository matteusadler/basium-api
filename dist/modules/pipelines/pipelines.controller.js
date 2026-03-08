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
exports.PipelinesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pipelines_service_1 = require("./pipelines.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const create_pipeline_dto_1 = require("./dto/create-pipeline.dto");
const update_pipeline_dto_1 = require("./dto/update-pipeline.dto");
const create_stage_dto_1 = require("./dto/create-stage.dto");
const update_stage_dto_1 = require("./dto/update-stage.dto");
let PipelinesController = class PipelinesController {
    constructor(pipelinesService) {
        this.pipelinesService = pipelinesService;
    }
    async findAll(user) {
        return this.pipelinesService.findAll(user.companyId);
    }
    async getDefault(user) {
        return this.pipelinesService.getDefault(user.companyId);
    }
    async findOne(id, user) {
        return this.pipelinesService.findOne(id, user.companyId);
    }
    async getKanbanStats(id, user) {
        return this.pipelinesService.getKanbanStats(id, user.companyId);
    }
    async create(user, dto) {
        return this.pipelinesService.create(user.companyId, dto);
    }
    async update(id, user, dto) {
        return this.pipelinesService.update(id, user.companyId, dto);
    }
    async delete(id, user) {
        return this.pipelinesService.delete(id, user.companyId);
    }
    async createStage(pipelineId, user, dto) {
        return this.pipelinesService.createStage(pipelineId, user.companyId, dto);
    }
    async reorderStages(pipelineId, user, body) {
        return this.pipelinesService.reorderStages(pipelineId, user.companyId, body.stageIds);
    }
    async updateStage(stageId, user, dto) {
        return this.pipelinesService.updateStage(stageId, user.companyId, dto);
    }
    async deleteStage(stageId, user) {
        return this.pipelinesService.deleteStage(stageId, user.companyId);
    }
};
exports.PipelinesController = PipelinesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all pipelines' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PipelinesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('default'),
    (0, swagger_1.ApiOperation)({ summary: 'Get default pipeline' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PipelinesController.prototype, "getDefault", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pipeline by ID with stages' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PipelinesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/kanban-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get kanban stats for pipeline' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PipelinesController.prototype, "getKanbanStats", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new pipeline' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_pipeline_dto_1.CreatePipelineDto]),
    __metadata("design:returntype", Promise)
], PipelinesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update pipeline' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_pipeline_dto_1.UpdatePipelineDto]),
    __metadata("design:returntype", Promise)
], PipelinesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete pipeline' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PipelinesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/stages'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new stage in pipeline' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_stage_dto_1.CreateStageDto]),
    __metadata("design:returntype", Promise)
], PipelinesController.prototype, "createStage", null);
__decorate([
    (0, common_1.Put)(':id/stages/reorder'),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder stages in pipeline' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PipelinesController.prototype, "reorderStages", null);
__decorate([
    (0, common_1.Put)('stages/:stageId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update stage' }),
    __param(0, (0, common_1.Param)('stageId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_stage_dto_1.UpdateStageDto]),
    __metadata("design:returntype", Promise)
], PipelinesController.prototype, "updateStage", null);
__decorate([
    (0, common_1.Delete)('stages/:stageId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete stage' }),
    __param(0, (0, common_1.Param)('stageId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PipelinesController.prototype, "deleteStage", null);
exports.PipelinesController = PipelinesController = __decorate([
    (0, swagger_1.ApiTags)('pipelines'),
    (0, common_1.Controller)('pipelines'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [pipelines_service_1.PipelinesService])
], PipelinesController);
//# sourceMappingURL=pipelines.controller.js.map