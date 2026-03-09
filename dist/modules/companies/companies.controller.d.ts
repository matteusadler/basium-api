import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesController {
    private companiesService;
    constructor(companiesService: CompaniesService);
    getCurrentCompany(user: any): Promise<any>;
    updateCurrentCompany(user: any, dto: UpdateCompanyDto): Promise<any>;
    getUsage(user: any): Promise<any>;
}
