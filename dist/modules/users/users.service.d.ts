import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        avatarUrl: string;
        isActive: boolean;
        waPhone: string;
        waConnectedAt: Date;
        aiEnabled: boolean;
    }[]>;
    findOne(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        avatarUrl: string;
        isActive: boolean;
        phoneNumberId: string;
        waPhone: string;
        waConnectedAt: Date;
        aiSystemPrompt: string;
        aiEnabled: boolean;
        aiWorkingHours: import("@prisma/client/runtime/library").JsonValue;
        aiMaxMessages: number;
        aiTransferKeywords: string[];
    }>;
    create(companyId: string, dto: CreateUserDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    update(id: string, companyId: string, dto: UpdateUserDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        avatarUrl: string;
        isActive: boolean;
        aiEnabled: boolean;
    }>;
    updateOpenAIKey(userId: string, companyId: string, openaiKey: string): Promise<{
        id: string;
        aiEnabled: boolean;
    }>;
    getDecryptedOpenAIKey(userId: string): Promise<string | null>;
    updateAIConfig(userId: string, companyId: string, config: any): Promise<{
        id: string;
        aiSystemPrompt: string;
        aiEnabled: boolean;
        aiWorkingHours: import("@prisma/client/runtime/library").JsonValue;
        aiMaxMessages: number;
        aiTransferKeywords: string[];
    }>;
    delete(id: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string | null;
        role: import(".prisma/client").$Enums.Role;
        avatarUrl: string | null;
        isActive: boolean;
        emailVerified: boolean;
        openaiKey: string | null;
        wabaId: string | null;
        phoneNumberId: string | null;
        waAccessToken: string | null;
        waPhone: string | null;
        waConnectedAt: Date | null;
        aiSystemPrompt: string | null;
        aiEnabled: boolean;
        aiWorkingHours: import("@prisma/client/runtime/library").JsonValue | null;
        aiMaxMessages: number;
        aiTransferKeywords: string[];
        pushSubscription: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
