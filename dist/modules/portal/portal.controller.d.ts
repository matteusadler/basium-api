import { PortalService } from './portal.service';
export declare class PortalController {
    private portalService;
    constructor(portalService: PortalService);
    getConfig(user: any): Promise<any>;
}
