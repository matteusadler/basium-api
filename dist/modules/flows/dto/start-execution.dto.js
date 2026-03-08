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
exports.StartExecutionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class StartExecutionDto {
}
exports.StartExecutionDto = StartExecutionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID do lead' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartExecutionDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Telefone do contato' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartExecutionDto.prototype, "contactPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Variáveis iniciais' }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StartExecutionDto.prototype, "variables", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID do nó inicial (opcional, usa trigger padrão)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StartExecutionDto.prototype, "startNodeId", void 0);
//# sourceMappingURL=start-execution.dto.js.map