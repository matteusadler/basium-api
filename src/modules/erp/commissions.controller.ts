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
import { CommissionsService } from './commissions.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@ApiTags('commissions')
@Controller('commissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommissionsController {
  constructor(private commissionsService: CommissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all commissions' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'contractId', required: false })
  @ApiQuery({ name: 'recipientId', required: false })
  async findAll(@CurrentUser() user: any, @Query() filters: any) {
    return this.commissionsService.findAll(user.companyId, filters)
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get commissions summary' })
  async getSummary(@CurrentUser() user: any) {
    return this.commissionsService.getSummary(user.companyId)
  }

  @Get('by-recipient')
  @ApiOperation({ summary: 'Get commissions grouped by recipient' })
  async getByRecipient(@CurrentUser() user: any) {
    return this.commissionsService.getByRecipient(user.companyId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get commission by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.commissionsService.findOne(id, user.companyId)
  }

  @Post()
  @ApiOperation({ summary: 'Create new commission' })
  async create(@CurrentUser() user: any, @Body() dto: any) {
    return this.commissionsService.create(user.companyId, dto)
  }

  @Put(':id/pay')
  @ApiOperation({ summary: 'Mark commission as paid' })
  async markPaid(@Param('id') id: string, @CurrentUser() user: any) {
    return this.commissionsService.markPaid(id, user.companyId)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete commission' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.commissionsService.delete(id, user.companyId)
  }

  @Post('generate/:contractId')
  @ApiOperation({ summary: 'Generate commissions for a contract' })
  async generateForContract(
    @Param('contractId') contractId: string,
    @CurrentUser() user: any,
    @Body() body: { rules: any[] },
  ) {
    return this.commissionsService.generateForContract(
      user.companyId,
      contractId,
      body.rules,
    )
  }
}
