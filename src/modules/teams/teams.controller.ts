import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { TeamsService } from './teams.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@ApiTags('teams')
@Controller('teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.teamsService.findAll(user.companyId)
  }

  @Post()
  create(@CurrentUser() user: any, @Body() body: { name: string; color?: string }) {
    return this.teamsService.create(user.companyId, body)
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() body: { name?: string; color?: string }) {
    return this.teamsService.update(id, user.companyId, body)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teamsService.remove(id, user.companyId)
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @CurrentUser() user: any, @Body() body: { userId: string }) {
    return this.teamsService.addMember(id, user.companyId, body.userId)
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() user: any) {
    return this.teamsService.removeMember(id, user.companyId, userId)
  }
}
