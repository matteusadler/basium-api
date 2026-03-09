import { PrismaService } from '../../common/prisma/prisma.service';
export declare class PortalService {
    private prisma;
    constructor(prisma: PrismaService);
    getConfig(companyId: string): Promise<any>;
}
