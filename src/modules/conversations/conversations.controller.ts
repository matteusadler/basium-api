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
import { ConversationsService } from './conversations.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { ConversationFiltersDto } from './dto/conversation-filters.dto'
import { SendMessageDto } from './dto/send-message.dto'

@ApiTags('conversations')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  // ================== CONVERSATIONS ==================

  @Get()
  @ApiOperation({ summary: 'List all conversations' })
  async findAll(@CurrentUser() user: any, @Query() filters: ConversationFiltersDto) {
    return this.conversationsService.findAll(user.companyId, filters)
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get conversation statistics' })
  @ApiQuery({ name: 'userId', required: false })
  async getStats(@CurrentUser() user: any, @Query('userId') userId?: string) {
    return this.conversationsService.getStats(user.companyId, userId)
  }

  @Get('by-phone/:phone')
  @ApiOperation({ summary: 'Get conversation by phone number' })
  async findByPhone(@Param('phone') phone: string, @CurrentUser() user: any) {
    return this.conversationsService.findByPhone(user.companyId, phone)
  }

  @Get('by-lead/:leadId')
  @ApiOperation({ summary: 'Get conversation by lead ID' })
  async findByLead(@Param('leadId') leadId: string, @CurrentUser() user: any) {
    return this.conversationsService.findByLead(user.companyId, leadId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation with messages' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.conversationsService.findOne(id, user.companyId)
  }

  // ================== MESSAGES ==================

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages for conversation (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMessages(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.conversationsService.getMessages(
      id,
      user.companyId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    )
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send message in conversation' })
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: SendMessageDto,
  ) {
    return this.conversationsService.sendMessage(id, user.companyId, user.sub, dto)
  }

  // ================== BOT CONTROL ==================

  @Put(':id/toggle-bot')
  @ApiOperation({ summary: 'Toggle AI bot active status' })
  async toggleBot(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { isActive: boolean },
  ) {
    return this.conversationsService.toggleBot(id, user.companyId, body.isActive)
  }

  @Put(':id/toggle-copilot')
  @ApiOperation({ summary: 'Toggle Co-Pilot assist mode' })
  async toggleCoPilot(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { isActive: boolean },
  ) {
    return this.conversationsService.toggleCoPilot(id, user.companyId, body.isActive)
  }

  @Put(':id/assume')
  @ApiOperation({ summary: 'Assume conversation (disable bot, enable co-pilot)' })
  async assumeConversation(@Param('id') id: string, @CurrentUser() user: any) {
    return this.conversationsService.assumeConversation(id, user.companyId)
  }

  @Put(':id/reactivate-bot')
  @ApiOperation({ summary: 'Reactivate AI bot' })
  async reactivateBot(@Param('id') id: string, @CurrentUser() user: any) {
    return this.conversationsService.reactivateBot(id, user.companyId)
  }

  // ================== READ STATUS ==================

  @Put(':id/mark-read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.conversationsService.markAsRead(id, user.companyId)
  }

  @Put(':id/mark-unread')
  @ApiOperation({ summary: 'Mark conversation as unread' })
  async markAsUnread(@Param('id') id: string, @CurrentUser() user: any) {
    return this.conversationsService.markAsUnread(id, user.companyId)
  }

  // ================== AI SUGGESTIONS ==================

  @Get(':id/suggestions')
  @ApiOperation({ summary: 'Get AI suggestions for conversation' })
  async getSuggestions(@Param('id') id: string, @CurrentUser() user: any) {
    return this.conversationsService.getSuggestions(id, user.companyId)
  }

  @Put('suggestions/:suggestionId/use')
  @ApiOperation({ summary: 'Mark suggestion as used' })
  async useSuggestion(
    @Param('suggestionId') suggestionId: string,
    @CurrentUser() user: any,
    @Body() body: { edited?: boolean },
  ) {
    return this.conversationsService.useSuggestion(
      suggestionId,
      user.companyId,
      body.edited,
    )
  }

  @Delete('suggestions/:suggestionId')
  @ApiOperation({ summary: 'Dismiss/delete suggestion' })
  async dismissSuggestion(
    @Param('suggestionId') suggestionId: string,
    @CurrentUser() user: any,
  ) {
    return this.conversationsService.dismissSuggestion(suggestionId, user.companyId)
  }
}
