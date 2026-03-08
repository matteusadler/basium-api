import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class PortalService {
  constructor(private prisma: PrismaService) {}

  async getConfig(companyId: string) {
    return this.prisma.portalConfig.findUnique({
      where: { companyId },
    })
  }
}
