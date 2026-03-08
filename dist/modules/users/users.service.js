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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const bcrypt = require("bcrypt");
const CryptoJS = require("crypto-js");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(companyId) {
        return this.prisma.user.findMany({
            where: { companyId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatarUrl: true,
                isActive: true,
                aiEnabled: true,
                waPhone: true,
                waConnectedAt: true,
                createdAt: true,
            },
        });
    }
    async findOne(id, companyId) {
        const user = await this.prisma.user.findFirst({
            where: { id, companyId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatarUrl: true,
                isActive: true,
                aiEnabled: true,
                aiSystemPrompt: true,
                aiWorkingHours: true,
                aiMaxMessages: true,
                aiTransferKeywords: true,
                waPhone: true,
                waConnectedAt: true,
                phoneNumberId: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        return user;
    }
    async create(companyId, dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ForbiddenException('Email já cadastrado');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        return this.prisma.user.create({
            data: {
                companyId,
                email: dto.email,
                name: dto.name,
                passwordHash: hashedPassword,
                role: (dto.role || 'CORRETOR'),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
    }
    async update(id, companyId, dto) {
        const user = await this.prisma.user.findFirst({
            where: { id, companyId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const updateData = { ...dto };
        if (dto.password) {
            updateData.passwordHash = await bcrypt.hash(dto.password, 10);
            delete updateData.password;
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatarUrl: true,
                isActive: true,
                aiEnabled: true,
                createdAt: true,
            },
        });
    }
    async updateOpenAIKey(userId, companyId, openaiKey) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, companyId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const encryptionKey = process.env.ENCRYPTION_KEY;
        if (!encryptionKey) {
            throw new Error('ENCRYPTION_KEY not configured');
        }
        const encryptedKey = CryptoJS.AES.encrypt(openaiKey, encryptionKey).toString();
        return this.prisma.user.update({
            where: { id: userId },
            data: { openaiKey: encryptedKey },
            select: { id: true, aiEnabled: true },
        });
    }
    async getDecryptedOpenAIKey(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { openaiKey: true },
        });
        if (!user?.openaiKey) {
            return null;
        }
        const encryptionKey = process.env.ENCRYPTION_KEY;
        if (!encryptionKey) {
            throw new Error('ENCRYPTION_KEY not configured');
        }
        const bytes = CryptoJS.AES.decrypt(user.openaiKey, encryptionKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
    async updateAIConfig(userId, companyId, config) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, companyId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                aiEnabled: config.aiEnabled,
                aiSystemPrompt: config.aiSystemPrompt,
                aiWorkingHours: config.aiWorkingHours,
                aiMaxMessages: config.aiMaxMessages,
                aiTransferKeywords: config.aiTransferKeywords,
            },
            select: {
                id: true,
                aiEnabled: true,
                aiSystemPrompt: true,
                aiWorkingHours: true,
                aiMaxMessages: true,
                aiTransferKeywords: true,
            },
        });
    }
    async delete(id, companyId) {
        const user = await this.prisma.user.findFirst({
            where: { id, companyId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map