import { PropertiesService } from './properties.service';
export declare class PropertiesController {
    private propertiesService;
    constructor(propertiesService: PropertiesService);
    findAll(user: any, filters: any): Promise<any>;
    getStats(user: any): Promise<{
        total: number;
        available: number;
        rented: number;
        sold: number;
        totalSaleValue: number;
        totalRentValue: number;
    }>;
    getAddressByCep(cep: string): Promise<{
        street: any;
        neighborhood: any;
        city: any;
        state: any;
        zipCode: string;
    }>;
    findOne(id: string, user: any): Promise<any>;
    create(user: any, dto: any): Promise<any>;
    update(id: string, user: any, dto: any): Promise<any>;
    delete(id: string, user: any): Promise<any>;
    addMedia(id: string, user: any, mediaData: any): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        order: number;
        propertyId: string;
        url: string;
        thumbnailUrl: string | null;
        isCover: boolean;
    }>;
    removeMedia(mediaId: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        order: number;
        propertyId: string;
        url: string;
        thumbnailUrl: string | null;
        isCover: boolean;
    }>;
    generateDescription(id: string, user: any): Promise<{
        description: string;
    }>;
}
