import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AiService } from './ai.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { ChatDto } from './dto/chat.dto'

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI assistant' })
  async chat(@CurrentUser() user: any, @Body() dto: ChatDto) {
    const response = await this.aiService.chat(
      user.sub,
      user.companyId,
      dto.message,
      dto.history || [],
    )

    return { response }
  }

  @Post('analyze-lead')
  @ApiOperation({ summary: 'Analyze lead qualification' })
  async analyzeLeadQualification(
    @CurrentUser() user: any,
    @Body() body: { leadId: string },
  ) {
    // Would need to fetch lead and conversation history
    // For now, return placeholder
    return { message: 'Analysis would be performed here' }
  }

  @Post('generate-suggestions')
  @ApiOperation({ summary: 'Generate Co-Pilot suggestions for a message' })
  async generateSuggestions(
    @CurrentUser() user: any,
    @Body() body: { leadId: string; message: string },
  ) {
    // Would need to fetch lead data
    // For now, return placeholder
    return { suggestions: [] }
  }

  @Post('suggest-reply')
  @ApiOperation({ summary: 'Generate 3 reply suggestions for WhatsApp (Co-Pilot)' })
  async suggestReply(
    @CurrentUser() user: any,
    @Body()
    body: {
      conversationId: string
      leadId: string
      lastMessages: Array<{ role: 'user' | 'assistant'; content: string }>
    },
  ) {
    const userId = user.sub ?? user.id
    const companyId = user.companyId
    const suggestions = await this.aiService.suggestReply(
      userId,
      companyId,
      body.conversationId,
      body.leadId ?? '',
      body.lastMessages ?? [],
    )
    return { suggestions }
  }
}
