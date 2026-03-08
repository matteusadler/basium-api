import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesController {
    private companiesService;
    constructor(companiesService: CompaniesService);
    getCurrentCompany(user: any): Promise<{
        usage: {
            id: string;
            companyId: string;
            updatedAt: Date;
            leadsCount: number;
            usersCount: number;
            propertiesCount: number;
            contractsCount: number;
            activeFlows: number;
            flowExecMonth: number;
            storageBytes: bigint;
            pdfCount: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        cnpj: string | null;
        logo: string | null;
        planId: string;
        planStatus: import(".prisma/client").$Enums.PlanStatus;
        trialEndsAt: Date | null;
        stripeCustomerId: string | null;
        stripeSubId: string | null;
    }>;
    updateCurrentCompany(user: any, dto: UpdateCompanyDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        cnpj: string | null;
        logo: string | null;
        planId: string;
        planStatus: import(".prisma/client").$Enums.PlanStatus;
        trialEndsAt: Date | null;
        stripeCustomerId: string | null;
        stripeSubId: string | null;
    }>;
    getUsage(user: any): Promise<{
        id: string;
        companyId: string;
        updatedAt: Date;
        leadsCount: number;
        usersCount: number;
        propertiesCount: number;
        contractsCount: number;
        activeFlows: number;
        flowExecMonth: number;
        storageBytes: bigint;
        pdfCount: number;
    }>;
}
