import { PrismaService } from '../../common/prisma/prisma.service';
export declare class PropertiesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string, filters?: any): Promise<any>;
    findOne(id: string, companyId: string): Promise<any>;
    create(companyId: string, userId: string, dto: any): Promise<any>;
    update(id: string, companyId: string, dto: any): Promise<any>;
    delete(id: string, companyId: string): Promise<any>;
    addMedia(id: string, companyId: string, mediaData: any): Promise<any>;
    removeMedia(mediaId: string, companyId: string): Promise<any>;
    setAiDescription(id: string, companyId: string, description: string): Promise<any>;
    getAddressByCep(cep: string): Promise<{
        street: any;
        neighborhood: any;
        city: any;
        state: any;
        zipCode: string;
    }>;
    findAllPublic(filters?: any): Promise<any>;
    findOnePublic(id: string): Promise<{
        street: any;
        number: any;
        zipCode: any;
        features: any;
        latitude: any;
        longitude: any;
        id: any;
        code: any;
        title: string;
        type: any;
        purpose: any;
        salePrice: any;
        rentPrice: any;
        area: any;
        bedrooms: any;
        bathrooms: any;
        parkingSpaces: any;
        city: any;
        neighborhood: any;
        state: any;
        description: any;
        media: any;
    }>;
    private toPublicProperty;
    getStats(companyId: string): Promise<{
        total: any;
        available: any;
        rented: any;
        sold: any;
        totalSaleValue: any;
        totalRentValue: any;
    }>;
}
