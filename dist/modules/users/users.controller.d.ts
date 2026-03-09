import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateAIConfigDto } from './dto/update-ai-config.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(user: any): Promise<any>;
    findOne(id: string, user: any): Promise<any>;
    create(user: any, dto: CreateUserDto): Promise<any>;
    update(id: string, user: any, dto: UpdateUserDto): Promise<any>;
    updateOpenAIKey(id: string, user: any, body: {
        openaiKey: string;
    }): Promise<any>;
    updateAIConfig(id: string, user: any, dto: UpdateAIConfigDto): Promise<any>;
    delete(id: string, user: any): Promise<any>;
}
