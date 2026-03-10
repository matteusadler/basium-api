import { PropertiesService } from './properties.service';
export declare class PublicPropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    findAll(filters: any): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
}
