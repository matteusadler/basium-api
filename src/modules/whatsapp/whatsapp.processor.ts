import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../../common/prisma/prisma.service'
import { WhatsappService, IncomingMessage } from './whatsapp.service'
import { ConversationsService } from '../conversations/conversations.service'
import { LeadsService } from '../leads/leads.service'
import { AiService } from '../ai/ai.service'

@Processor('whatsapp')
export class WhatsappProcessor extends WorkerHost {
  private readonly logger = new Logger(WhatsappProcessor.name)

  constructor(
    private prisma: PrismaService,
    private whatsappService: WhatsappService,
    private conversationsService: ConversationsService,
    private leadsService: LeadsService,
    private aiService: AiService,
  ) {
    super()
  }

  async process(job: Job<any>): Promise<any> {
    const { name, data } = job

    switch (name) {
      case 'process-message':
        return this.processIncomingMessage(data)
      default:
        this.logger.warn(`Unknown job type: ${name}`)
    }
  }

  private async processIncomingMessage(data: {
    phoneNumberId: string
    message: IncomingMessage
    contact: any
    receivedAt: string
  }): Promise<void> {
    const { phoneNumberId, message, contact } = data

    try {
      // 1. Find user (tenant) by phoneNumberId
      const user = await this.whatsappService.getUserByPhoneNumberId(phoneNumberId)
      const companyId = user.companyId

      // 2. Extract message content
      const messageContent = this.extractMessageContent(message)
      const senderPhone = message.from
      const senderName = contact?.profile?.name || senderPhone

      // 3. Find or create lead
      let lead = await this.prisma.lead.findFirst({
        where: { companyId, phone: senderPhone },
      })

      if (!lead) {
        // Create new lead from incoming message
        const defaultPipeline = await this.prisma.pipeline.findFirst({
          where: { companyId, isDefault: true },
          include: { stages: { orderBy: { order: 'asc' }, take: 1 } },
        })

        if (defaultPipeline && defaultPipeline.stages[0]) {
          lead = await this.prisma.lead.create({
            data: {
              companyId,
              userId: user.id,
              name: senderName,
              phone: senderPhone,
              origin: 'WHATSAPP',
              temperature: 'WARM',
              pipelineId: defaultPipeline.id,
              stageId: defaultPipeline.stages[0].id,
            },
          })

          // Create history event
          await this.prisma.leadHistory.create({
            data: {
              leadId: lead.id,
              userId: user.id,
              event: 'LEAD_CREATED',
              metadata: { origin: 'WHATSAPP', autoCreated: true },
            },
          })
        }
      }

      if (!lead) {
        this.logger.error('Could not find or create lead')
        return
      }

      // 4. Find or create conversation
      let conversation = await this.prisma.conversation.findFirst({
        where: { companyId, phone: senderPhone },
      })

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            companyId,
            leadId: lead.id,
            userId: user.id,
            phone: senderPhone,
            isBotActive: user.aiEnabled,
            aiAssistMode: false,
          },
        })
      }

      // 5. Save incoming message
      const savedMessage = await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: messageContent.text,
          type: messageContent.type,
          direction: 'INBOUND',
          sender: 'USER',
          mediaUrl: messageContent.mediaUrl,
        },
      })

      // 6. Update conversation
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessage: messageContent.text.substring(0, 100),
          lastMessageAt: new Date(),
          unreadCount: { increment: 1 },
        },
      })

      // 7. Update lead last interaction
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: { lastInteraction: new Date() },
      })

      // 8. Check if AI should respond
      if (conversation.isBotActive && user.aiEnabled && user.openaiKey) {
        await this.handleAIResponse(
          user,
          conversation,
          lead,
          messageContent.text,
        )
      }

      // 9. Generate Co-Pilot suggestion if enabled
      if (!conversation.isBotActive && conversation.aiAssistMode && user.openaiKey) {
        await this.generateCoPilotSuggestion(
          user,
          conversation,
          lead,
          messageContent.text,
        )
      }

    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`, error.stack)
      throw error
    }
  }

  private extractMessageContent(message: IncomingMessage): {
    text: string
    type: string
    mediaUrl?: string
  } {
    if (message.text) {
      return { text: message.text.body, type: 'TEXT' }
    }

    if (message.image) {
      return {
        text: message.image.caption || '[Imagem]',
        type: 'IMAGE',
        mediaUrl: message.image.id, // Media ID to be resolved later
      }
    }

    if (message.document) {
      return {
        text: message.document.caption || `[Documento: ${message.document.filename}]`,
        type: 'DOCUMENT',
        mediaUrl: message.document.id,
      }
    }

    if (message.audio) {
      return {
        text: '[\u00c1udio]',
        type: 'AUDIO',
        mediaUrl: message.audio.id,
      }
    }

    if (message.video) {
      return {
        text: message.video.caption || '[V\u00eddeo]',
        type: 'VIDEO',
        mediaUrl: message.video.id,
      }
    }

    if (message.location) {
      return {
        text: `[Localiza\u00e7\u00e3o: ${message.location.address || `${message.location.latitude}, ${message.location.longitude}`}]`,
        type: 'LOCATION',
      }
    }

    if (message.button) {
      return { text: message.button.text, type: 'BUTTON' }
    }

    if (message.interactive) {
      const reply = message.interactive.button_reply || message.interactive.list_reply
      return { text: reply?.title || '[Intera\u00e7\u00e3o]', type: 'INTERACTIVE' }
    }

    return { text: '[Mensagem n\u00e3o suportada]', type: 'UNKNOWN' }
  }

  private async handleAIResponse(
    user: any,
    conversation: any,
    lead: any,
    incomingText: string,
  ): Promise<void> {
    try {
      // Check working hours
      if (!this.isWithinWorkingHours(user.aiWorkingHours)) {
        this.logger.log('Outside working hours - AI will not respond')
        return
      }

      // Check for transfer keywords
      if (this.shouldTransferToHuman(incomingText, user.aiTransferKeywords)) {
        await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: { isBotActive: false },
        })
        // TODO: Notify user about transfer request
        return
      }

      // Get conversation history
      const history = await this.prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })

      // Generate AI response
      const aiResponse = await this.aiService.generateResponse(
        user.id,
        lead,
        history.reverse(),
        incomingText,
        user.aiSystemPrompt,
      )

      if (aiResponse) {
        // Send message via WhatsApp
        const sendResult = await this.whatsappService.sendTextMessage(
          user.phoneNumberId,
          user.waAccessToken,
          conversation.phone,
          aiResponse,
        )

        // Save outgoing message
        await this.prisma.message.create({
          data: {
            conversationId: conversation.id,
            content: aiResponse,
            type: 'TEXT',
            direction: 'OUTBOUND',
            sender: 'AI',
            status: 'SENT',
            metaMessageId: sendResult.messages?.[0]?.id,
          },
        })

        // Update conversation
        await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessage: aiResponse.substring(0, 100),
            lastMessageAt: new Date(),
          },
        })
      }
    } catch (error) {
      this.logger.error(`AI response error: ${error.message}`)
    }
  }

  private async generateCoPilotSuggestion(
    user: any,
    conversation: any,
    lead: any,
    incomingText: string,
  ): Promise<void> {
    try {
      const suggestions = await this.aiService.generateCoPilotSuggestions(
        user.id,
        lead,
        incomingText,
      )

      for (const suggestion of suggestions) {
        await this.prisma.aiSuggestion.create({
          data: {
            conversationId: conversation.id,
            leadId: lead.id,
            suggestedText: suggestion.text,
            suggestionType: suggestion.type,
          },
        })
      }
    } catch (error) {
      this.logger.error(`Co-Pilot suggestion error: ${error.message}`)
    }
  }

  private isWithinWorkingHours(workingHours: any): boolean {
    if (!workingHours) return true

    const now = new Date()
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayOfWeek = days[now.getDay()]
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute

    const todayHours = workingHours[dayOfWeek]
    if (!todayHours || !todayHours.enabled) return false

    const [startHour, startMin] = todayHours.start.split(':').map(Number)
    const [endHour, endMin] = todayHours.end.split(':').map(Number)
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    return currentTime >= startTime && currentTime <= endTime
  }

  private shouldTransferToHuman(text: string, keywords: string[]): boolean {
    if (!keywords || keywords.length === 0) return false

    const lowerText = text.toLowerCase()
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))
  }
}
