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
exports.FlowsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const flows_service_1 = require("./flows.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const create_flow_dto_1 = require("./dto/create-flow.dto");
const update_flow_dto_1 = require("./dto/update-flow.dto");
const start_execution_dto_1 = require("./dto/start-execution.dto");
let FlowsController = class FlowsController {
    constructor(flowsService) {
        this.flowsService = flowsService;
    }
    async findAll(user) {
        return this.flowsService.findAll(user.companyId);
    }
    async getTemplates() {
        return this.flowsService.getTemplates();
    }
    async findOne(id, user) {
        return this.flowsService.findOne(id, user.companyId);
    }
    async create(dto, user) {
        return this.flowsService.create(user.companyId, user.id, dto);
    }
    async createFromTemplate(templateId, name, user) {
        return this.flowsService.createFromTemplate(templateId, user.companyId, user.id, name);
    }
    async update(id, dto, user) {
        return this.flowsService.update(id, user.companyId, dto);
    }
    async delete(id, user) {
        return this.flowsService.delete(id, user.companyId);
    }
    async publish(id, user) {
        return this.flowsService.publish(id, user.companyId);
    }
    async pause(id, user) {
        return this.flowsService.pause(id, user.companyId);
    }
    async resume(id, user) {
        return this.flowsService.resume(id, user.companyId);
    }
    async archive(id, user) {
        return this.flowsService.archive(id, user.companyId);
    }
    async toggle(id, user) {
        return this.flowsService.toggle(id, user.companyId);
    }
    async startExecution(flowId, dto, user) {
        return this.flowsService.startExecution(flowId, user.companyId, dto);
    }
    async getExecutions(flowId, limit, user) {
        return this.flowsService.getExecutions(flowId, user.companyId, limit);
    }
    async getExecution(executionId, user) {
        return this.flowsService.getExecution(executionId, user.companyId);
    }
    async stopExecution(executionId, user) {
        return this.flowsService.stopExecution(executionId, user.companyId);
    }
    async getAnalytics(flowId, user) {
        return this.flowsService.getFlowAnalytics(flowId, user.companyId);
    }
};
exports.FlowsController = FlowsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os fluxos' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar templates de fluxo disponíveis' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar fluxo por ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo fluxo' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_flow_dto_1.CreateFlowDto, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('from-template/:templateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar fluxo a partir de template' }),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "createFromTemplate", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar fluxo' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_flow_dto_1.UpdateFlowDto, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir fluxo' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, swagger_1.ApiOperation)({ summary: 'Publicar fluxo (DRAFT -> ACTIVE)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/pause'),
    (0, swagger_1.ApiOperation)({ summary: 'Pausar fluxo (ACTIVE -> PAUSED)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "pause", null);
__decorate([
    (0, common_1.Post)(':id/resume'),
    (0, swagger_1.ApiOperation)({ summary: 'Retomar fluxo (PAUSED -> ACTIVE)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "resume", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, swagger_1.ApiOperation)({ summary: 'Arquivar fluxo' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "archive", null);
__decorate([
    (0, common_1.Put)(':id/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Ativar/Desativar fluxo (toggle ACTIVE <-> PAUSED/DRAFT)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "toggle", null);
__decorate([
    (0, common_1.Post)(':id/execute'),
    (0, swagger_1.ApiOperation)({ summary: 'Iniciar execução do fluxo para um lead' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, start_execution_dto_1.StartExecutionDto, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "startExecution", null);
__decorate([
    (0, common_1.Get)(':id/executions'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar execuções do fluxo' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "getExecutions", null);
__decorate([
    (0, common_1.Get)('executions/:executionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Detalhe de uma execução' }),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "getExecution", null);
__decorate([
    (0, common_1.Post)('executions/:executionId/stop'),
    (0, swagger_1.ApiOperation)({ summary: 'Parar execução de um lead' }),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "stopExecution", null);
__decorate([
    (0, common_1.Get)(':id/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Analytics do fluxo (contagem por nó)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "getAnalytics", null);
exports.FlowsController = FlowsController = __decorate([
    (0, swagger_1.ApiTags)('flows'),
    (0, common_1.Controller)('flows'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [flows_service_1.FlowsService])
], FlowsController);
//# sourceMappingURL=flows.controller.js.map