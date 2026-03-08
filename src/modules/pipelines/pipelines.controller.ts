import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PipelinesService } from './pipelines.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { CreatePipelineDto } from './dto/create-pipeline.dto'
import { UpdatePipelineDto } from './dto/update-pipeline.dto'
import { CreateStageDto } from './dto/create-stage.dto'
import { UpdateStageDto } from './dto/update-stage.dto'

@ApiTags('pipelines')
@Controller('pipelines')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PipelinesController {
  constructor(private pipelinesService: PipelinesService) {}

  // ================== PIPELINES ==================

  @Get()
  @ApiOperation({ summary: 'List all pipelines' })
  async findAll(@CurrentUser() user: any) {
    return this.pipelinesService.findAll(user.companyId)
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default pipeline' })
  async getDefault(@CurrentUser() user: any) {
    return this.pipelinesService.getDefault(user.companyId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pipeline by ID with stages' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pipelinesService.findOne(id, user.companyId)
  }

  @Get(':id/kanban-stats')
  @ApiOperation({ summary: 'Get kanban stats for pipeline' })
  async getKanbanStats(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pipelinesService.getKanbanStats(id, user.companyId)
  }

  @Post()
  @ApiOperation({ summary: 'Create new pipeline' })
  async create(@CurrentUser() user: any, @Body() dto: CreatePipelineDto) {
    return this.pipelinesService.create(user.companyId, dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update pipeline' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdatePipelineDto,
  ) {
    return this.pipelinesService.update(id, user.companyId, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pipeline' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pipelinesService.delete(id, user.companyId)
  }

  // ================== STAGES ==================

  @Post(':id/stages')
  @ApiOperation({ summary: 'Create new stage in pipeline' })
  async createStage(
    @Param('id') pipelineId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateStageDto,
  ) {
    return this.pipelinesService.createStage(pipelineId, user.companyId, dto)
  }

  @Put(':id/stages/reorder')
  @ApiOperation({ summary: 'Reorder stages in pipeline' })
  async reorderStages(
    @Param('id') pipelineId: string,
    @CurrentUser() user: any,
    @Body() body: { stageIds: string[] },
  ) {
    return this.pipelinesService.reorderStages(pipelineId, user.companyId, body.stageIds)
  }

  @Put('stages/:stageId')
  @ApiOperation({ summary: 'Update stage' })
  async updateStage(
    @Param('stageId') stageId: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateStageDto,
  ) {
    return this.pipelinesService.updateStage(stageId, user.companyId, dto)
  }

  @Delete('stages/:stageId')
  @ApiOperation({ summary: 'Delete stage' })
  async deleteStage(@Param('stageId') stageId: string, @CurrentUser() user: any) {
    return this.pipelinesService.deleteStage(stageId, user.companyId)
  }
}
