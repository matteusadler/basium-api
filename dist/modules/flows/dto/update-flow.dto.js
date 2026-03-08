"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFlowDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_flow_dto_1 = require("./create-flow.dto");
class UpdateFlowDto extends (0, swagger_1.PartialType)(create_flow_dto_1.CreateFlowDto) {
}
exports.UpdateFlowDto = UpdateFlowDto;
//# sourceMappingURL=update-flow.dto.js.map