import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { PropertiesService } from './properties.service'

@ApiTags('public')
@Controller('public/properties')
export class PublicPropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar imóveis disponíveis (público, sem auth)' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'purpose', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'neighborhood', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  async findAll(@Query() filters: any) {
    return this.propertiesService.findAllPublic(filters)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do imóvel por ID (público, sem auth)' })
  async findOne(@Param('id') id: string) {
    return this.propertiesService.findOnePublic(id)
  }
}
