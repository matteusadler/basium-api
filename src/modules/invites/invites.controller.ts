import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { InvitesService } from './invites.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@ApiTags('invites')
@Controller('invites')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@CurrentUser() user: any, @Body() body: {
    email: string
    name?: string
    role: string
    expiresInHours?: number
  }) {
    return this.invitesService.create(user.companyId, user.id, user.name, body)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@CurrentUser() user: any) {
    return this.invitesService.findAll(user.companyId)
  }

  @Get(':token/validate')
  validate(@Param('token') token: string) {
    return this.invitesService.validate(token)
  }

  @Post(':token/accept')
  accept(@Param('token') token: string, @Body() body: { name: string; password: string }) {
    return this.invitesService.accept(token, body)
  }
}
