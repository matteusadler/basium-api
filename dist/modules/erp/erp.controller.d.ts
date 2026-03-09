import { ErpService } from './erp.service';
export declare class ErpController {
    private erpService;
    constructor(erpService: ErpService);
    getProperties(user: any): Promise<any>;
    getContracts(user: any): Promise<any>;
}
