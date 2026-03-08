import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { FinancialService } from './financial.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@ApiTags('financial')
@Controller('financial')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FinancialController {
  constructor(private financialService: FinancialService) {}

  @Get()
  @ApiOperation({ summary: 'List all financial entries' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'contractId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async findAll(@CurrentUser() user: any, @Query() filters: any) {
    return this.financialService.findAll(user.companyId, filters)
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getSummary(@CurrentUser() user: any, @Query() filters: any) {
    return this.financialService.getSummary(user.companyId, filters)
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Get financial entries grouped by category' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getByCategory(@CurrentUser() user: any, @Query() filters: any) {
    return this.financialService.getByCategory(user.companyId, filters)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get financial entry by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.financialService.findOne(id, user.companyId)
  }

  @Post()
  @ApiOperation({ summary: 'Create new financial entry' })
  async create(@CurrentUser() user: any, @Body() dto: any) {
    return this.financialService.create(user.companyId, dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update financial entry' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: any,
  ) {
    return this.financialService.update(id, user.companyId, dto)
  }

  @Put(':id/pay')
  @ApiOperation({ summary: 'Mark financial entry as paid' })
  async markPaid(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() paymentData?: any,
  ) {
    return this.financialService.markPaid(id, user.companyId, paymentData)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete financial entry' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.financialService.delete(id, user.companyId)
  }

  @Post('owner-transfer')
  @ApiOperation({ summary: 'Generate owner transfer for a contract' })
  async generateOwnerTransfer(
    @CurrentUser() user: any,
    @Body() body: { contractId: string; month: string },
  ) {
    return this.financialService.generateOwnerTransfer(
      user.companyId,
      body.contractId,
      body.month,
    )
  }
}
