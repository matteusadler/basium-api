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
import { PropertiesService } from './properties.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@ApiTags('properties')
@Controller('properties')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'List all properties' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'purpose', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'neighborhood', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'bedrooms', required: false })
  async findAll(@CurrentUser() user: any, @Query() filters: any) {
    return this.propertiesService.findAll(user.companyId, filters)
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get properties statistics' })
  async getStats(@CurrentUser() user: any) {
    return this.propertiesService.getStats(user.companyId)
  }

  @Get('cep/:cep')
  @ApiOperation({ summary: 'Get address by CEP (ViaCEP)' })
  async getAddressByCep(@Param('cep') cep: string) {
    return this.propertiesService.getAddressByCep(cep)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.propertiesService.findOne(id, user.companyId)
  }

  @Post()
  @ApiOperation({ summary: 'Create new property' })
  async create(@CurrentUser() user: any, @Body() dto: any) {
    return this.propertiesService.create(user.companyId, user.id, dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update property' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: any,
  ) {
    return this.propertiesService.update(id, user.companyId, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete property' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.propertiesService.delete(id, user.companyId)
  }

  @Post(':id/media')
  @ApiOperation({ summary: 'Add media to property' })
  async addMedia(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() mediaData: any,
  ) {
    return this.propertiesService.addMedia(id, user.companyId, mediaData)
  }

  @Delete('media/:mediaId')
  @ApiOperation({ summary: 'Remove media from property' })
  async removeMedia(@Param('mediaId') mediaId: string, @CurrentUser() user: any) {
    return this.propertiesService.removeMedia(mediaId, user.companyId)
  }

  @Post(':id/generate-description')
  @ApiOperation({ summary: 'Generate AI description for property' })
  async generateDescription(@Param('id') id: string, @CurrentUser() user: any) {
    // AI description generation will be implemented with LLM integration
    // For now, return a placeholder
    const property = await this.propertiesService.findOne(id, user.companyId)
    const description = `Excelente ${property.type.toLowerCase()} com ${property.bedrooms || 0} quartos, localizado em ${property.neighborhood}, ${property.city}. ${property.features?.length > 0 ? `Conta com: ${property.features.join(', ')}.` : ''}`
    await this.propertiesService.setAiDescription(id, user.companyId, description)
    return { description }
  }
}
