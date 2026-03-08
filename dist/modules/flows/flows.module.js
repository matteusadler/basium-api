"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const flows_controller_1 = require("./flows.controller");
const flows_service_1 = require("./flows.service");
const flow_executor_service_1 = require("./flow-executor.service");
const prisma_module_1 = require("../../common/prisma/prisma.module");
const flow_engine_processor_1 = require("./processors/flow-engine.processor");
const flow_message_processor_1 = require("./processors/flow-message.processor");
const flow_wait_processor_1 = require("./processors/flow-wait.processor");
let FlowsModule = class FlowsModule {
};
exports.FlowsModule = FlowsModule;
exports.FlowsModule = FlowsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            bullmq_1.BullModule.registerQueue({ name: 'flow-engine', connection: { host: 'localhost', port: 6379 } }, { name: 'flow-message', connection: { host: 'localhost', port: 6379 } }, { name: 'flow-wait', connection: { host: 'localhost', port: 6379 } }),
        ],
        controllers: [flows_controller_1.FlowsController],
        providers: [
            flows_service_1.FlowsService,
            flow_executor_service_1.FlowExecutorService,
            flow_engine_processor_1.FlowEngineProcessor,
            flow_message_processor_1.FlowMessageProcessor,
            flow_wait_processor_1.FlowWaitProcessor,
        ],
        exports: [flows_service_1.FlowsService, flow_executor_service_1.FlowExecutorService],
    })
], FlowsModule);
//# sourceMappingURL=flows.module.js.map