import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { OwnersService } from './owners.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@ApiTags('owners')
@Controller('owners')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OwnersController {
  constructor(private ownersService: OwnersService) {}

  @Get()
  @ApiOperation({ summary: 'List all owners' })
  async findAll(@CurrentUser() user: any) {
    return this.ownersService.findAll(user.companyId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get owner by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ownersService.findOne(id, user.companyId)
  }

  @Post()
  @ApiOperation({ summary: 'Create new owner' })
  async create(@CurrentUser() user: any, @Body() dto: any) {
    return this.ownersService.create(user.companyId, dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update owner' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: any,
  ) {
    return this.ownersService.update(id, user.companyId, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete owner' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ownersService.delete(id, user.companyId)
  }

  @Post(':id/link-property')
  @ApiOperation({ summary: 'Link owner to property' })
  async linkToProperty(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { propertyId: string; ownershipPct?: number },
  ) {
    return this.ownersService.linkToProperty(
      id,
      body.propertyId,
      user.companyId,
      body.ownershipPct,
    )
  }

  @Delete(':id/unlink-property/:propertyId')
  @ApiOperation({ summary: 'Unlink owner from property' })
  async unlinkFromProperty(
    @Param('id') id: string,
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: any,
  ) {
    return this.ownersService.unlinkFromProperty(id, propertyId, user.companyId)
  }
}
