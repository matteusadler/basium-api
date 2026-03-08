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
exports.CreateStageDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateStageDto {
}
exports.CreateStageDto = CreateStageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Nova Etapa' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStageDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#6366f1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStageDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStageDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStageDto.prototype, "probability", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['INITIAL', 'INTERMEDIATE', 'WON', 'LOST'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['INITIAL', 'INTERMEDIATE', 'WON', 'LOST']),
    __metadata("design:type", String)
], CreateStageDto.prototype, "type", void 0);
//# sourceMappingURL=create-stage.dto.js.map