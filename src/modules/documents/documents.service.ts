import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.document.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, companyId: string) {
    return this.prisma.document.findFirst({
      where: { id, companyId },
      // chunks removido temporariamente (requer pgvector)
    })
  }

  async delete(id: string, companyId: string) {
    return this.prisma.document.deleteMany({
      where: { id, companyId },
    })
  }
}
