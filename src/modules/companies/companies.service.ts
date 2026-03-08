import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { UpdateCompanyDto } from './dto/update-company.dto'

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findOne(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        usage: true,
      },
    })

    if (!company) {
      throw new NotFoundException('Empresa não encontrada')
    }

    return company
  }

  async update(companyId: string, dto: UpdateCompanyDto) {
    return this.prisma.company.update({
      where: { id: companyId },
      data: dto,
    })
  }

  async updateUsage(companyId: string, field: string, increment: number = 1) {
    return this.prisma.companyUsage.upsert({
      where: { companyId },
      update: {
        [field]: { increment },
      },
      create: {
        companyId,
        [field]: increment,
      },
    })
  }

  async getUsage(companyId: string) {
    return this.prisma.companyUsage.findUnique({
      where: { companyId },
    })
  }
}
