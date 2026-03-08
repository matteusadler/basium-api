"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErpModule = void 0;
const common_1 = require("@nestjs/common");
const erp_service_1 = require("./erp.service");
const erp_controller_1 = require("./erp.controller");
const properties_controller_1 = require("./properties.controller");
const public_properties_controller_1 = require("./public-properties.controller");
const properties_service_1 = require("./properties.service");
const owners_controller_1 = require("./owners.controller");
const owners_service_1 = require("./owners.service");
const contracts_controller_1 = require("./contracts.controller");
const contracts_service_1 = require("./contracts.service");
const financial_controller_1 = require("./financial.controller");
const financial_service_1 = require("./financial.service");
const commissions_controller_1 = require("./commissions.controller");
const commissions_service_1 = require("./commissions.service");
const prisma_module_1 = require("../../common/prisma/prisma.module");
const notifications_module_1 = require("../notifications/notifications.module");
let ErpModule = class ErpModule {
};
exports.ErpModule = ErpModule;
exports.ErpModule = ErpModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, notifications_module_1.NotificationsModule],
        controllers: [
            erp_controller_1.ErpController,
            properties_controller_1.PropertiesController,
            public_properties_controller_1.PublicPropertiesController,
            owners_controller_1.OwnersController,
            contracts_controller_1.ContractsController,
            financial_controller_1.FinancialController,
            commissions_controller_1.CommissionsController,
        ],
        providers: [
            erp_service_1.ErpService,
            properties_service_1.PropertiesService,
            owners_service_1.OwnersService,
            contracts_service_1.ContractsService,
            financial_service_1.FinancialService,
            commissions_service_1.CommissionsService,
        ],
        exports: [
            erp_service_1.ErpService,
            properties_service_1.PropertiesService,
            owners_service_1.OwnersService,
            contracts_service_1.ContractsService,
            financial_service_1.FinancialService,
            commissions_service_1.CommissionsService,
        ],
    })
], ErpModule);
//# sourceMappingURL=erp.module.js.map