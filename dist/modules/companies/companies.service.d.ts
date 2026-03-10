import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(companyId: string): Promise<{
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
        stripeCustomerId: string | null;
        cnpj: string | null;
        logo: string | null;
        planId: string;
        planStatus: import(".prisma/client").$Enums.PlanStatus;
        trialEndsAt: Date | null;
        stripeSubId: string | null;
    }>;
    update(companyId: string, dto: UpdateCompanyDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        stripeCustomerId: string | null;
        cnpj: string | null;
        logo: string | null;
        planId: string;
        planStatus: import(".prisma/client").$Enums.PlanStatus;
        trialEndsAt: Date | null;
        stripeSubId: string | null;
    }>;
    updateUsage(companyId: string, field: string, increment?: number): Promise<{
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
    getUsage(companyId: string): Promise<{
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
