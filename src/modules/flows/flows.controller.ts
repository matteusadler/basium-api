import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { FlowsService } from './flows.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { CreateFlowDto } from './dto/create-flow.dto'
import { UpdateFlowDto } from './dto/update-flow.dto'
import { StartExecutionDto } from './dto/start-execution.dto'

@ApiTags('flows')
@Controller('flows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlowsController {
  constructor(private flowsService: FlowsService) {}

  // ════════════════════════════════════════════════════════════════════════
  // CRUD
  // ════════════════════════════════════════════════════════════════════════

  @Get()
  @ApiOperation({ summary: 'Listar todos os fluxos' })
  async findAll(@CurrentUser() user: any) {
    return this.flowsService.findAll(user.companyId)
  }

  @Get('templates')
  @ApiOperation({ summary: 'Listar templates de fluxo disponíveis' })
  async getTemplates() {
    return this.flowsService.getTemplates()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar fluxo por ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.flowsService.findOne(id, user.companyId)
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo fluxo' })
  async create(@Body() dto: CreateFlowDto, @CurrentUser() user: any) {
    return this.flowsService.create(user.companyId, user.id, dto)
  }

  @Post('from-template/:templateId')
  @ApiOperation({ summary: 'Criar fluxo a partir de template' })
  async createFromTemplate(
    @Param('templateId') templateId: string,
    @Body('name') name: string,
    @CurrentUser() user: any,
  ) {
    return this.flowsService.createFromTemplate(templateId, user.companyId, user.id, name)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar fluxo' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFlowDto,
    @CurrentUser() user: any,
  ) {
    return this.flowsService.update(id, user.companyId, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir fluxo' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.flowsService.delete(id, user.companyId)
  }

  // ════════════════════════════════════════════════════════════════════════
  // Status Management
  // ════════════════════════════════════════════════════════════════════════

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publicar fluxo (DRAFT -> ACTIVE)' })
  async publish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.flowsService.publish(id, user.companyId)
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pausar fluxo (ACTIVE -> PAUSED)' })
  async pause(@Param('id') id: string, @CurrentUser() user: any) {
    return this.flowsService.pause(id, user.companyId)
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Retomar fluxo (PAUSED -> ACTIVE)' })
  async resume(@Param('id') id: string, @CurrentUser() user: any) {
    return this.flowsService.resume(id, user.companyId)
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Arquivar fluxo' })
  async archive(@Param('id') id: string, @CurrentUser() user: any) {
    return this.flowsService.archive(id, user.companyId)
  }

  @Put(':id/toggle')
  @ApiOperation({ summary: 'Ativar/Desativar fluxo (toggle ACTIVE <-> PAUSED/DRAFT)' })
  async toggle(@Param('id') id: string, @CurrentUser() user: any) {
    return this.flowsService.toggle(id, user.companyId)
  }

  // ════════════════════════════════════════════════════════════════════════
  // Execution
  // ════════════════════════════════════════════════════════════════════════

  @Post(':id/execute')
  @ApiOperation({ summary: 'Iniciar execução do fluxo para um lead' })
  async startExecution(
    @Param('id') flowId: string,
    @Body() dto: StartExecutionDto,
    @CurrentUser() user: any,
  ) {
    return this.flowsService.startExecution(flowId, user.companyId, dto)
  }

  @Get(':id/executions')
  @ApiOperation({ summary: 'Listar execuções do fluxo' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getExecutions(
    @Param('id') flowId: string,
    @Query('limit') limit: number,
    @CurrentUser() user: any,
  ) {
    return this.flowsService.getExecutions(flowId, user.companyId, limit)
  }

  @Get('executions/:executionId')
  @ApiOperation({ summary: 'Detalhe de uma execução' })
  async getExecution(
    @Param('executionId') executionId: string,
    @CurrentUser() user: any,
  ) {
    return this.flowsService.getExecution(executionId, user.companyId)
  }

  @Post('executions/:executionId/stop')
  @ApiOperation({ summary: 'Parar execução de um lead' })
  async stopExecution(
    @Param('executionId') executionId: string,
    @CurrentUser() user: any,
  ) {
    return this.flowsService.stopExecution(executionId, user.companyId)
  }

  // ════════════════════════════════════════════════════════════════════════
  // Analytics
  // ════════════════════════════════════════════════════════════════════════

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Analytics do fluxo (contagem por nó)' })
  async getAnalytics(@Param('id') flowId: string, @CurrentUser() user: any) {
    return this.flowsService.getFlowAnalytics(flowId, user.companyId)
  }
}
