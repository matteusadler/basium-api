import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ErpService {
    private prisma;
    constructor(prisma: PrismaService);
    getProperties(companyId: string): Promise<any>;
    getContracts(companyId: string): Promise<any>;
}
