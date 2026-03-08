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
exports.UpdateAIConfigDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateAIConfigDto {
}
exports.UpdateAIConfigDto = UpdateAIConfigDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAIConfigDto.prototype, "aiEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'System prompt for AI assistant' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAIConfigDto.prototype, "aiSystemPrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Working hours JSON config' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateAIConfigDto.prototype, "aiWorkingHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Max messages before transfer to human' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAIConfigDto.prototype, "aiMaxMessages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Keywords that trigger transfer to human' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAIConfigDto.prototype, "aiTransferKeywords", void 0);
//# sourceMappingURL=update-ai-config.dto.js.map