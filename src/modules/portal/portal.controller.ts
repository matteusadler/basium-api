import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PortalService } from './portal.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@ApiTags('portal')
@Controller('portal')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PortalController {
  constructor(private portalService: PortalService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get portal configuration' })
  async getConfig(@CurrentUser() user: any) {
    return this.portalService.getConfig(user.companyId)
  }
}
