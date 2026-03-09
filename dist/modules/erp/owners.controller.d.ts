import { OwnersService } from './owners.service';
export declare class OwnersController {
    private ownersService;
    constructor(ownersService: OwnersService);
    findAll(user: any): Promise<any>;
    findOne(id: string, user: any): Promise<any>;
    create(user: any, dto: any): Promise<any>;
    update(id: string, user: any, dto: any): Promise<any>;
    delete(id: string, user: any): Promise<any>;
    linkToProperty(id: string, user: any, body: {
        propertyId: string;
        ownershipPct?: number;
    }): Promise<any>;
    unlinkFromProperty(id: string, propertyId: string, user: any): Promise<any>;
}
