import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Logger } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { TeamsService } from './teams.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@ApiTags('teams')
@Controller('teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamsController {
  private logger = new Logger('TeamsController')
  constructor(private teamsService: TeamsService) {}

  @Get()
  async findAll(@CurrentUser() user: any) {
    try {
      return await this.teamsService.findAll(user.companyId)
    } catch(e) {
      this.logger.error('findAll error: ' + e.message, e.stack)
      throw e
    }
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() body: { name: string; color?: string }) {
    try {
      this.logger.log('create team: ' + JSON.stringify({ companyId: user.companyId, body }))
      return await this.teamsService.create(user.companyId, body)
    } catch(e) {
      this.logger.error('create error: ' + e.message, e.stack)
      throw e
    }
  }

  @Put(':id')
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { name?: string; color?: string }) {
    try {
      return await this.teamsService.update(id, user.companyId, body)
    } catch(e) {
      this.logger.error('update error: ' + e.message, e.stack)
      throw e
    }
  }

  @Delete(':id')
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    try {
      return await this.teamsService.remove(id, user.companyId)
    } catch(e) {
      this.logger.error('remove error: ' + e.message, e.stack)
      throw e
    }
  }

  @Post(':id/members')
  async addMember(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { userId: string }) {
    try {
      return await this.teamsService.addMember(id, user.companyId, body.userId)
    } catch(e) {
      this.logger.error('addMember error: ' + e.message, e.stack)
      throw e
    }
  }

  @Delete(':id/members/:userId')
  async removeMember(@CurrentUser() user: any, @Param('id') id: string, @Param('userId') userId: string) {
    try {
      return await this.teamsService.removeMember(id, user.companyId, userId)
    } catch(e) {
      this.logger.error('removeMember error: ' + e.message, e.stack)
      throw e
    }
  }
}
