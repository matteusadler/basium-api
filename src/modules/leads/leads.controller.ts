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
import { LeadsService } from './leads.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { CreateLeadDto } from './dto/create-lead.dto'
import { UpdateLeadDto } from './dto/update-lead.dto'
import { LeadFiltersDto } from './dto/lead-filters.dto'
import { MoveStageDto } from './dto/move-stage.dto'
import { MarkLostDto } from './dto/mark-lost.dto'
import { MarkWonDto } from './dto/mark-won.dto'
import { CreateNoteDto } from './dto/create-note.dto'

@ApiTags('leads')
@Controller('leads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  // ================== CRUD ==================

  @Get()
  @ApiOperation({ summary: 'List leads with filters' })
  async findAll(@CurrentUser() user: any, @Query() filters: LeadFiltersDto) {
    if (user.role === 'CORRETOR') filters.userId = user.id
    return this.leadsService.findAll(user.companyId, filters)
  }

  @Get('kanban/:pipelineId')
  @ApiOperation({ summary: 'Get leads grouped by stage for Kanban view' })
  async findByStage(
    @Param('pipelineId') pipelineId: string,
    @CurrentUser() user: any,
  ) {
    return this.leadsService.findByStage(user.companyId, pipelineId, user.role === 'CORRETOR' ? user.id : undefined)
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lead statistics' })
  @ApiQuery({ name: 'userId', required: false })
  async getStats(@CurrentUser() user: any, @Query('userId') userId?: string) {
    return this.leadsService.getStats(user.companyId, userId)
  }

  @Get('check-duplicate')
  @ApiOperation({ summary: 'Check for duplicate leads by phone/email' })
  @ApiQuery({ name: 'phone', required: true })
  @ApiQuery({ name: 'email', required: false })
  async checkDuplicates(
    @CurrentUser() user: any,
    @Query('phone') phone: string,
    @Query('email') email?: string,
  ) {
    return this.leadsService.checkDuplicates(user.companyId, phone, email)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID with full details' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.findOne(id, user.companyId)
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get lead timeline/history' })
  async getTimeline(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.getTimeline(id, user.companyId)
  }

  @Post()
  @ApiOperation({ summary: 'Create new lead' })
  async create(@CurrentUser() user: any, @Body() dto: CreateLeadDto) {
    return this.leadsService.create(user.companyId, user.id, dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update lead' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadsService.update(id, user.companyId, user.id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive lead' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.delete(id, user.companyId, user.id)
  }

  // ================== STAGE ACTIONS ==================

  @Put(':id/move-stage')
  @ApiOperation({ summary: 'Move lead to different stage' })
  async moveStage(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: MoveStageDto,
  ) {
    return this.leadsService.moveStage(id, user.companyId, user.id, dto)
  }

  @Put(':id/mark-won')
  @ApiOperation({ summary: 'Mark lead as won' })
  async markAsWon(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: MarkWonDto,
  ) {
    return this.leadsService.markAsWon(id, user.companyId, user.id, dto)
  }

  @Put(':id/mark-lost')
  @ApiOperation({ summary: 'Mark lead as lost' })
  async markAsLost(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: MarkLostDto,
  ) {
    return this.leadsService.markAsLost(id, user.companyId, user.id, dto)
  }

  @Put(':id/reactivate')
  @ApiOperation({ summary: 'Reactivate archived/lost lead' })
  async reactivate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.reactivate(id, user.companyId, user.id)
  }

  @Put(':id/toggle-favorite')
  @ApiOperation({ summary: 'Toggle lead favorite status' })
  async toggleFavorite(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.toggleFavorite(id, user.companyId)
  }

  // ================== NOTES ==================

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add note to lead' })
  async addNote(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateNoteDto,
  ) {
    return this.leadsService.addNote(id, user.companyId, user.id, dto)
  }

  @Put('notes/:noteId')
  @ApiOperation({ summary: 'Update note' })
  async updateNote(
    @Param('noteId') noteId: string,
    @CurrentUser() user: any,
    @Body() body: { content: string },
  ) {
    return this.leadsService.updateNote(noteId, user.companyId, user.id, body.content)
  }

  @Put('notes/:noteId/toggle-pin')
  @ApiOperation({ summary: 'Toggle note pin status' })
  async togglePinNote(@Param('noteId') noteId: string, @CurrentUser() user: any) {
    return this.leadsService.togglePinNote(noteId, user.companyId)
  }

  @Delete('notes/:noteId')
  @ApiOperation({ summary: 'Delete note' })
  async deleteNote(@Param('noteId') noteId: string, @CurrentUser() user: any) {
    return this.leadsService.deleteNote(noteId, user.companyId, user.id)
  }

  // ================== ATTACHMENTS ==================

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Add attachment to lead' })
  async addAttachment(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() fileData: any,
  ) {
    return this.leadsService.addAttachment(id, user.companyId, user.id, fileData)
  }

  @Delete('attachments/:attachmentId')
  @ApiOperation({ summary: 'Delete attachment' })
  async deleteAttachment(
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: any,
  ) {
    return this.leadsService.deleteAttachment(attachmentId, user.companyId, user.id)
  }

  // ================== BULK OPERATIONS ==================

  @Post('bulk/move-stage')
  @ApiOperation({ summary: 'Move multiple leads to a stage' })
  async bulkMoveStage(
    @CurrentUser() user: any,
    @Body() body: { leadIds: string[]; stageId: string },
  ) {
    return this.leadsService.bulkUpdateStage(
      user.companyId,
      user.id,
      body.leadIds,
      body.stageId,
    )
  }

  @Post('bulk/assign')
  @ApiOperation({ summary: 'Assign multiple leads to a user' })
  async bulkAssign(
    @CurrentUser() user: any,
    @Body() body: { leadIds: string[]; userId: string },
  ) {
    return this.leadsService.bulkAssign(
      user.companyId,
      user.id,
      body.leadIds,
      body.userId,
    )
  }
}
