import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CompaniesService } from './companies.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { UpdateCompanyDto } from './dto/update-company.dto'

@ApiTags('companies')
@Controller('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current company' })
  async getCurrentCompany(@CurrentUser() user: any) {
    return this.companiesService.findOne(user.companyId)
  }

  @Put('current')
  @ApiOperation({ summary: 'Update current company' })
  async updateCurrentCompany(
    @CurrentUser() user: any,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(user.companyId, dto)
  }

  @Get('current/usage')
  @ApiOperation({ summary: 'Get company usage stats' })
  async getUsage(@CurrentUser() user: any) {
    return this.companiesService.getUsage(user.companyId)
  }
}
