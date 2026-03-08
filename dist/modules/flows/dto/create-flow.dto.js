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
exports.CreateFlowDto = exports.FlowEdge = exports.FlowNode = exports.FlowNodeData = exports.FlowNodePosition = exports.TriggerType = exports.NodeType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var NodeType;
(function (NodeType) {
    NodeType["TRIGGER"] = "TRIGGER";
    NodeType["TRIGGER_LEAD_STAGE"] = "trigger_lead_stage";
    NodeType["MESSAGE"] = "MESSAGE";
    NodeType["CONDITION"] = "CONDITION";
    NodeType["WAIT"] = "WAIT";
    NodeType["ACTION"] = "ACTION";
    NodeType["ACTION_CREATE_TASK"] = "action_create_task";
    NodeType["ACTION_SEND_EMAIL"] = "action_send_email";
    NodeType["ACTION_MOVE_LEAD"] = "action_move_lead";
    NodeType["ACTION_NOTIFICATION"] = "action_notification";
    NodeType["AI"] = "AI";
    NodeType["SPLIT_AB"] = "SPLIT_AB";
    NodeType["JUMP"] = "JUMP";
})(NodeType || (exports.NodeType = NodeType = {}));
var TriggerType;
(function (TriggerType) {
    TriggerType["KEYWORD"] = "KEYWORD";
    TriggerType["FIRST_MESSAGE"] = "FIRST_MESSAGE";
    TriggerType["WEBHOOK"] = "WEBHOOK";
    TriggerType["SCHEDULE"] = "SCHEDULE";
    TriggerType["FORM_SUBMIT"] = "FORM_SUBMIT";
    TriggerType["LEAD_CREATED"] = "LEAD_CREATED";
    TriggerType["LEAD_UPDATED"] = "LEAD_UPDATED";
    TriggerType["STAGE_CHANGED"] = "STAGE_CHANGED";
    TriggerType["TASK_CREATED"] = "TASK_CREATED";
    TriggerType["TASK_COMPLETED"] = "TASK_COMPLETED";
})(TriggerType || (exports.TriggerType = TriggerType = {}));
class FlowNodePosition {
}
exports.FlowNodePosition = FlowNodePosition;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], FlowNodePosition.prototype, "x", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], FlowNodePosition.prototype, "y", void 0);
class FlowNodeData {
}
exports.FlowNodeData = FlowNodeData;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "triggerType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], FlowNodeData.prototype, "keywords", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "messageType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], FlowNodeData.prototype, "delay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "waitType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], FlowNodeData.prototype, "timeout", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "timeoutAction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], FlowNodeData.prototype, "delaySeconds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "operator", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "actionType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "aiAction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "prompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "splitName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], FlowNodeData.prototype, "variants", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "targetNodeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowNodeData.prototype, "targetFlowId", void 0);
class FlowNode {
}
exports.FlowNode = FlowNode;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlowNode.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: NodeType }),
    (0, class_validator_1.IsEnum)(NodeType),
    __metadata("design:type", String)
], FlowNode.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: FlowNodePosition }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FlowNodePosition),
    __metadata("design:type", FlowNodePosition)
], FlowNode.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: FlowNodeData }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FlowNodeData),
    __metadata("design:type", FlowNodeData)
], FlowNode.prototype, "data", void 0);
class FlowEdge {
}
exports.FlowEdge = FlowEdge;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlowEdge.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlowEdge.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlowEdge.prototype, "target", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowEdge.prototype, "sourceHandle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FlowEdge.prototype, "targetHandle", void 0);
class CreateFlowDto {
}
exports.CreateFlowDto = CreateFlowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nome do fluxo' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFlowDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Descrição do fluxo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFlowDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nós do fluxo', type: [FlowNode] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FlowNode),
    __metadata("design:type", Array)
], CreateFlowDto.prototype, "nodes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Conexões entre nós', type: [FlowEdge] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FlowEdge),
    __metadata("design:type", Array)
], CreateFlowDto.prototype, "edges", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tipos de gatilhos do fluxo' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateFlowDto.prototype, "triggerTypes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Palavras-chave para gatilho KEYWORD' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateFlowDto.prototype, "keywords", void 0);
//# sourceMappingURL=create-flow.dto.js.map