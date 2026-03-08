import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class ErpService {
  constructor(private prisma: PrismaService) {}

  async getProperties(companyId: string) {
    return this.prisma.property.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getContracts(companyId: string) {
    return this.prisma.contract.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    })
  }
}
