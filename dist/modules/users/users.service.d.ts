import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string): Promise<any>;
    findOne(id: string, companyId: string): Promise<any>;
    create(companyId: string, dto: CreateUserDto): Promise<any>;
    update(id: string, companyId: string, dto: UpdateUserDto): Promise<any>;
    updateOpenAIKey(userId: string, companyId: string, openaiKey: string): Promise<any>;
    getDecryptedOpenAIKey(userId: string): Promise<string | null>;
    updateAIConfig(userId: string, companyId: string, config: any): Promise<any>;
    delete(id: string, companyId: string): Promise<any>;
}
