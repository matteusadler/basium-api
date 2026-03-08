import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private documentsService;
    constructor(documentsService: DocumentsService);
    findAll(user: any): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        status: string;
        userId: string;
        url: string;
        size: number;
    }[]>;
    findOne(id: string, user: any): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        status: string;
        userId: string;
        url: string;
        size: number;
    }>;
    delete(id: string, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
