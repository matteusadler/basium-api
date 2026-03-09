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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Usuário inativo');
        }
        const { passwordHash, ...result } = user;
        return result;
    }
    async login(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            companyId: user.companyId,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyId: user.companyId,
            },
        };
    }
    async register(data) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new common_1.UnauthorizedException('Email já cadastrado');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const company = await this.prisma.company.create({
            data: {
                name: data.companyName,
                planId: 'starter',
                planStatus: 'TRIAL',
                trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                passwordHash: hashedPassword,
                companyId: company.id,
                role: 'ADMIN',
            },
        });
        const pipeline = await this.prisma.pipeline.create({
            data: {
                companyId: company.id,
                name: 'Vendas',
                type: 'SALE',
                isDefault: true,
                stages: {
                    create: [
                        { name: 'Novo Lead', color: '#6366f1', order: 1, probability: 10, type: 'INITIAL' },
                        { name: 'Contato Feito', color: '#8b5cf6', order: 2, probability: 25, type: 'INTERMEDIATE' },
                        { name: 'Visita Agendada', color: '#a855f7', order: 3, probability: 50, type: 'INTERMEDIATE' },
                        { name: 'Proposta Enviada', color: '#c084fc', order: 4, probability: 75, type: 'INTERMEDIATE' },
                        { name: 'Negociação', color: '#d8b4fe', order: 5, probability: 85, type: 'INTERMEDIATE' },
                        { name: 'Ganho', color: '#10b981', order: 6, probability: 100, type: 'WON' },
                        { name: 'Perdido', color: '#ef4444', order: 7, probability: 0, type: 'LOST' },
                    ],
                },
            },
        });
        const { passwordHash, ...result } = user;
        return this.login(result);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.passwordHash) {
            throw new common_1.UnauthorizedException('Usuário não encontrado');
        }
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Senha atual incorreta');
        }
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        return { success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map