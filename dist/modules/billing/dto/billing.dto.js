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
exports.UpdatePaymentMethodDto = exports.CreatePortalSessionDto = exports.CreateCheckoutSessionDto = exports.PaymentMethod = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CARD"] = "card";
    PaymentMethod["BOLETO"] = "boleto";
    PaymentMethod["APPLE_PAY"] = "apple_pay";
    PaymentMethod["GOOGLE_PAY"] = "google_pay";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
class CreateCheckoutSessionDto {
}
exports.CreateCheckoutSessionDto = CreateCheckoutSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID do plano' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCheckoutSessionDto.prototype, "planId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Billing anual (true) ou mensal (false)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCheckoutSessionDto.prototype, "yearly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: PaymentMethod, description: 'Método de pagamento preferido' }),
    (0, class_validator_1.IsEnum)(PaymentMethod),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCheckoutSessionDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL de sucesso após pagamento' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCheckoutSessionDto.prototype, "successUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL de cancelamento' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCheckoutSessionDto.prototype, "cancelUrl", void 0);
class CreatePortalSessionDto {
}
exports.CreatePortalSessionDto = CreatePortalSessionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL de retorno após sair do portal' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePortalSessionDto.prototype, "returnUrl", void 0);
class UpdatePaymentMethodDto {
}
exports.UpdatePaymentMethodDto = UpdatePaymentMethodDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID do método de pagamento Stripe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePaymentMethodDto.prototype, "paymentMethodId", void 0);
//# sourceMappingURL=billing.dto.js.map