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
var PlanGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanGuard = exports.PlanLimit = exports.PLAN_LIMIT_KEY = exports.PlanFeature = exports.PLAN_FEATURE_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
exports.PLAN_FEATURE_KEY = 'plan_feature';
const PlanFeature = (feature) => {
    return (target, key, descriptor) => {
        Reflect.defineMetadata(exports.PLAN_FEATURE_KEY, feature, descriptor?.value ?? target);
        return descriptor;
    };
};
exports.PlanFeature = PlanFeature;
exports.PLAN_LIMIT_KEY = 'plan_limit';
const PlanLimit = (resource) => {
    return (target, key, descriptor) => {
        Reflect.defineMetadata(exports.PLAN_LIMIT_KEY, resource, descriptor?.value ?? target);
        return descriptor;
    };
};
exports.PlanLimit = PlanLimit;
let PlanGuard = PlanGuard_1 = class PlanGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
        this.logger = new common_1.Logger(PlanGuard_1.name);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user?.companyId) {
            throw new common_1.ForbiddenException('Usuário não autenticado');
        }
        const requiredFeature = this.reflector.get(exports.PLAN_FEATURE_KEY, context.getHandler());
        const requiredLimit = this.reflector.get(exports.PLAN_LIMIT_KEY, context.getHandler());
        if (!requiredFeature && !requiredLimit) {
            return true;
        }
        const company = await this.prisma.company.findUnique({
            where: { id: user.companyId },
            include: { usage: true },
        });
        if (!company) {
            throw new common_1.ForbiddenException('Empresa não encontrada');
        }
        if (company.planStatus === 'CANCELLED') {
            throw new common_1.ForbiddenException('Assinatura cancelada. Por favor, renove seu plano.');
        }
        if (company.planStatus === 'OVERDUE') {
            throw new common_1.ForbiddenException('Pagamento pendente. Por favor, regularize sua assinatura.');
        }
        const plan = await this.prisma.plan.findUnique({
            where: { id: company.planId },
        });
        if (!plan) {
            throw new common_1.ForbiddenException('Plano não encontrado');
        }
        if (requiredFeature) {
            const hasFeature = this.checkFeature(plan, requiredFeature);
            if (!hasFeature) {
                throw new common_1.ForbiddenException(`Recurso "${requiredFeature}" não disponível no seu plano. Faça upgrade para acessar.`);
            }
        }
        if (requiredLimit && company.usage) {
            const limitExceeded = this.checkLimit(plan, company.usage, requiredLimit);
            if (limitExceeded) {
                throw new common_1.ForbiddenException(`Limite de "${requiredLimit}" atingido no seu plano. Faça upgrade para continuar.`);
            }
        }
        return true;
    }
    checkFeature(plan, feature) {
        switch (feature) {
            case 'ai':
                return plan.hasAi;
            case 'copilot':
                return plan.hasCopilot;
            case 'flow_builder':
                return plan.hasFlowBuilder;
            case 'portals':
                return plan.hasPortals;
            default:
                this.logger.warn(`Unknown feature: ${feature}`);
                return true;
        }
    }
    checkLimit(plan, usage, resource) {
        switch (resource) {
            case 'leads':
                return usage.leadsCount >= plan.maxLeads;
            case 'users':
                return usage.usersCount >= plan.maxUsers;
            case 'whatsapp_numbers':
                return false;
            case 'pipelines':
                return false;
            case 'flows':
                return usage.activeFlows >= plan.maxFlows;
            case 'flow_executions':
                return usage.flowExecMonth >= plan.maxFlowExecutions;
            case 'storage':
                const storageGb = Number(usage.storageBytes) / (1024 * 1024 * 1024);
                return storageGb >= plan.storageGb;
            default:
                this.logger.warn(`Unknown resource limit: ${resource}`);
                return false;
        }
    }
};
exports.PlanGuard = PlanGuard;
exports.PlanGuard = PlanGuard = PlanGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], PlanGuard);
//# sourceMappingURL=plan.guard.js.map