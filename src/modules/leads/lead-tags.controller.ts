import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PrismaService } from '../../common/prisma/prisma.service'

@Controller('lead-tags')
@UseGuards(JwtAuthGuard)
export class LeadTagsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.prisma.$queryRaw`
      SELECT * FROM "LeadTag" WHERE "companyId" = ${req.user.companyId} ORDER BY name ASC
    `
  }

  @Post()
  async create(@Request() req: any, @Body() body: { name: string; color?: string }) {
    return this.prisma.$queryRaw`
      INSERT INTO "LeadTag" (id, "companyId", name, color, "createdAt")
      VALUES (gen_random_uuid(), ${req.user.companyId}, ${body.name}, ${body.color || '#6366f1'}, NOW())
      ON CONFLICT ("companyId", name) DO NOTHING
      RETURNING *
    `
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.prisma.$queryRaw`
      DELETE FROM "LeadTag" WHERE id = ${id} AND "companyId" = ${req.user.companyId}
    `
    return { ok: true }
  }

  @Post(':leadId/assign/:tagId')
  async assignTag(@Param('leadId') leadId: string, @Param('tagId') tagId: string) {
    await this.prisma.$queryRaw`
      INSERT INTO "LeadTagOnLead" ("leadId", "tagId", "createdAt")
      VALUES (${leadId}, ${tagId}, NOW())
      ON CONFLICT DO NOTHING
    `
    return { ok: true }
  }

  @Delete(':leadId/assign/:tagId')
  async removeTag(@Param('leadId') leadId: string, @Param('tagId') tagId: string) {
    await this.prisma.$queryRaw`
      DELETE FROM "LeadTagOnLead" WHERE "leadId" = ${leadId} AND "tagId" = ${tagId}
    `
    return { ok: true }
  }
}
