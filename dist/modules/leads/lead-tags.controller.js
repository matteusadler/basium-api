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
exports.LeadTagsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let LeadTagsController = class LeadTagsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(req) {
        return this.prisma.$queryRaw `
      SELECT * FROM "LeadTag" WHERE "companyId" = ${req.user.companyId} ORDER BY name ASC
    `;
    }
    async create(req, body) {
        return this.prisma.$queryRaw `
      INSERT INTO "LeadTag" (id, "companyId", name, color, "createdAt")
      VALUES (gen_random_uuid(), ${req.user.companyId}, ${body.name}, ${body.color || '#6366f1'}, NOW())
      ON CONFLICT ("companyId", name) DO NOTHING
      RETURNING *
    `;
    }
    async remove(id, req) {
        await this.prisma.$queryRaw `
      DELETE FROM "LeadTag" WHERE id = ${id} AND "companyId" = ${req.user.companyId}
    `;
        return { ok: true };
    }
    async assignTag(leadId, tagId) {
        await this.prisma.$queryRaw `
      INSERT INTO "LeadTagOnLead" ("leadId", "tagId", "createdAt")
      VALUES (${leadId}, ${tagId}, NOW())
      ON CONFLICT DO NOTHING
    `;
        return { ok: true };
    }
    async removeTag(leadId, tagId) {
        await this.prisma.$queryRaw `
      DELETE FROM "LeadTagOnLead" WHERE "leadId" = ${leadId} AND "tagId" = ${tagId}
    `;
        return { ok: true };
    }
};
exports.LeadTagsController = LeadTagsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeadTagsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadTagsController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadTagsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':leadId/assign/:tagId'),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, common_1.Param)('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeadTagsController.prototype, "assignTag", null);
__decorate([
    (0, common_1.Delete)(':leadId/assign/:tagId'),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, common_1.Param)('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeadTagsController.prototype, "removeTag", null);
exports.LeadTagsController = LeadTagsController = __decorate([
    (0, common_1.Controller)('lead-tags'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadTagsController);
//# sourceMappingURL=lead-tags.controller.js.map