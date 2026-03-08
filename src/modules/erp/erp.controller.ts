import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ErpService } from './erp.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@ApiTags('erp')
@Controller('erp')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ErpController {
  constructor(private erpService: ErpService) {}

  @Get('properties')
  @ApiOperation({ summary: 'List all properties' })
  async getProperties(@CurrentUser() user: any) {
    return this.erpService.getProperties(user.companyId)
  }

  @Get('contracts')
  @ApiOperation({ summary: 'List all contracts' })
  async getContracts(@CurrentUser() user: any) {
    return this.erpService.getContracts(user.companyId)
  }
}
