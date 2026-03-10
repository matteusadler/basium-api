import { PrismaService } from '../../common/prisma/prisma.service';
export declare class LeadTagsController {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(req: any): Promise<unknown>;
    create(req: any, body: {
        name: string;
        color?: string;
    }): Promise<unknown>;
    remove(id: string, req: any): Promise<{
        ok: boolean;
    }>;
    assignTag(leadId: string, tagId: string): Promise<{
        ok: boolean;
    }>;
    removeTag(leadId: string, tagId: string): Promise<{
        ok: boolean;
    }>;
}
