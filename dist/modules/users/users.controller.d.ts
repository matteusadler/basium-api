import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateAIConfigDto } from './dto/update-ai-config.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(user: any): Promise<{
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
    findOne(id: string, user: any): Promise<{
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
    create(user: any, dto: CreateUserDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    update(id: string, user: any, dto: UpdateUserDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        avatarUrl: string;
        isActive: boolean;
        aiEnabled: boolean;
    }>;
    updateOpenAIKey(id: string, user: any, body: {
        openaiKey: string;
    }): Promise<{
        id: string;
        aiEnabled: boolean;
    }>;
    updateAIConfig(id: string, user: any, dto: UpdateAIConfigDto): Promise<{
        id: string;
        aiSystemPrompt: string;
        aiEnabled: boolean;
        aiWorkingHours: import("@prisma/client/runtime/library").JsonValue;
        aiMaxMessages: number;
        aiTransferKeywords: string[];
    }>;
    delete(id: string, user: any): Promise<{
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
