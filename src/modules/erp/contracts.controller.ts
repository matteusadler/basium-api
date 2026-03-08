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
import { ContractsService } from './contracts.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@ApiTags('contracts')
@Controller('contracts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Get()
  @ApiOperation({ summary: 'List all contracts' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'propertyId', required: false })
  @ApiQuery({ name: 'leadId', required: false })
  async findAll(@CurrentUser() user: any, @Query() filters: any) {
    return this.contractsService.findAll(user.companyId, filters)
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get contracts statistics' })
  async getStats(@CurrentUser() user: any) {
    return this.contractsService.getStats(user.companyId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.contractsService.findOne(id, user.companyId)
  }

  @Post()
  @ApiOperation({ summary: 'Create new contract' })
  async create(@CurrentUser() user: any, @Body() dto: any) {
    return this.contractsService.create(user.companyId, user.id, dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contract' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: any,
  ) {
    return this.contractsService.update(id, user.companyId, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contract' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.contractsService.delete(id, user.companyId)
  }

  @Post(':id/documents')
  @ApiOperation({ summary: 'Add document to contract' })
  async addDocument(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() docData: any,
  ) {
    return this.contractsService.addDocument(id, user.companyId, docData)
  }

  @Post(':id/generate-entries')
  @ApiOperation({ summary: 'Generate rental entries for contract' })
  async generateRentalEntries(@Param('id') id: string, @CurrentUser() user: any) {
    return this.contractsService.generateRentalEntries(id, user.companyId)
  }
}
