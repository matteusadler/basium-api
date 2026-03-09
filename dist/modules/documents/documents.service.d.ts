import { PrismaService } from '../../common/prisma/prisma.service';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string): Promise<any>;
    findOne(id: string, companyId: string): Promise<any>;
    delete(id: string, companyId: string): Promise<any>;
}
