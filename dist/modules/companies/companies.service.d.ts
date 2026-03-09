import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(companyId: string): Promise<any>;
    update(companyId: string, dto: UpdateCompanyDto): Promise<any>;
    updateUsage(companyId: string, field: string, increment?: number): Promise<any>;
    getUsage(companyId: string): Promise<any>;
}
