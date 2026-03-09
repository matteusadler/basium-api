import { PrismaService } from '../../common/prisma/prisma.service';
export declare class OwnersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string): Promise<any>;
    findOne(id: string, companyId: string): Promise<any>;
    create(companyId: string, dto: any): Promise<any>;
    update(id: string, companyId: string, dto: any): Promise<any>;
    delete(id: string, companyId: string): Promise<any>;
    linkToProperty(ownerId: string, propertyId: string, companyId: string, ownershipPct?: number): Promise<any>;
    unlinkFromProperty(ownerId: string, propertyId: string, companyId: string): Promise<any>;
}
