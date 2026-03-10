import { PrismaService } from '../../common/prisma/prisma.service';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        userId: string;
        status: string;
        url: string;
        size: number;
    }[]>;
    findOne(id: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        userId: string;
        status: string;
        url: string;
        size: number;
    }>;
    delete(id: string, companyId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
