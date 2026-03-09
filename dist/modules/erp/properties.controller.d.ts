import { PropertiesService } from './properties.service';
export declare class PropertiesController {
    private propertiesService;
    constructor(propertiesService: PropertiesService);
    findAll(user: any, filters: any): Promise<any>;
    getStats(user: any): Promise<{
        total: any;
        available: any;
        rented: any;
        sold: any;
        totalSaleValue: any;
        totalRentValue: any;
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
    addMedia(id: string, user: any, mediaData: any): Promise<any>;
    removeMedia(mediaId: string, user: any): Promise<any>;
    generateDescription(id: string, user: any): Promise<{
        description: string;
    }>;
}
