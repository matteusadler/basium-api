import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.team.findMany({
      where: { companyId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
  }

  async create(companyId: string, data: { name: string; color?: string }) {
    return this.prisma.team.create({
      data: { companyId, name: data.name, color: data.color || '#6366f1' }
    })
  }

  async update(id: string, companyId: string, data: { name?: string; color?: string }) {
    await this.findTeam(id, companyId)
    return this.prisma.team.update({ where: { id }, data })
  }

  async remove(id: string, companyId: string) {
    await this.findTeam(id, companyId)
    return this.prisma.team.delete({ where: { id } })
  }

  async addMember(teamId: string, companyId: string, userId: string) {
    await this.findTeam(teamId, companyId)
    return this.prisma.teamMember.create({ data: { teamId, userId } })
  }

  async removeMember(teamId: string, companyId: string, userId: string) {
    await this.findTeam(teamId, companyId)
    return this.prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId } } })
  }

  private async findTeam(id: string, companyId: string) {
    const team = await this.prisma.team.findFirst({ where: { id, companyId } })
    if (!team) throw new NotFoundException('Equipe não encontrada')
    return team
  }
}
