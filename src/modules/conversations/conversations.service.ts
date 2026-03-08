import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { WhatsappService } from '../whatsapp/whatsapp.service'
import { ConversationFiltersDto } from './dto/conversation-filters.dto'
import { SendMessageDto } from './dto/send-message.dto'

@Injectable()
export class ConversationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => WhatsappService))
    private whatsappService: WhatsappService,
  ) {}

  // ================== CONVERSATIONS ==================

  async findAll(companyId: string, filters: ConversationFiltersDto) {
    const where: any = { companyId }

    if (filters.userId) where.userId = filters.userId
    if (filters.hasUnread) where.unreadCount = { gt: 0 }
    if (filters.isBotActive !== undefined) where.isBotActive = filters.isBotActive

    if (filters.search) {
      where.OR = [
        { phone: { contains: filters.search } },
        { lead: { name: { contains: filters.search, mode: 'insensitive' } } },
      ]
    }

    return this.prisma.conversation.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            temperature: true,
            stage: { select: { name: true, color: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    })
  }

  async findOne(id: string, companyId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id, companyId },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            temperature: true,
            priority: true,
            tags: true,
            stage: { select: { name: true, color: true } },
            pipeline: { select: { name: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        aiSuggestions: {
          where: { used: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada')
    }

    return conversation
  }

  async findByPhone(companyId: string, phone: string) {
    return this.prisma.conversation.findFirst({
      where: { companyId, phone },
      include: {
        lead: {
          select: { id: true, name: true },
        },
      },
    })
  }

  async findByLead(companyId: string, leadId: string) {
    return this.prisma.conversation.findFirst({
      where: { companyId, leadId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  }

  // ================== MESSAGES ==================

  async getMessages(conversationId: string, companyId: string, page: number = 1, limit: number = 50) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, companyId },
    })

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada')
    }

    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ])

    return {
      data: messages.reverse(), // Return in chronological order
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async sendMessage(
    conversationId: string,
    companyId: string,
    userId: string,
    dto: SendMessageDto,
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, companyId },
    })

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada')
    }

    // Get user's WhatsApp config
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      select: {
        phoneNumberId: true,
        waAccessToken: true,
      },
    })

    if (!user?.phoneNumberId || !user?.waAccessToken) {
      throw new NotFoundException('WhatsApp não configurado')
    }

    // Send via WhatsApp
    let sendResult: any

    try {
      switch (dto.type) {
        case 'text':
          sendResult = await this.whatsappService.sendTextMessage(
            user.phoneNumberId,
            user.waAccessToken,
            conversation.phone,
            dto.content,
          )
          break

        case 'image':
          sendResult = await this.whatsappService.sendImageMessage(
            user.phoneNumberId,
            user.waAccessToken,
            conversation.phone,
            dto.mediaUrl!,
            dto.content,
          )
          break

        case 'document':
          sendResult = await this.whatsappService.sendDocumentMessage(
            user.phoneNumberId,
            user.waAccessToken,
            conversation.phone,
            dto.mediaUrl!,
            dto.filename || 'documento',
            dto.content,
          )
          break

        case 'template':
          sendResult = await this.whatsappService.sendTemplateMessage(
            user.phoneNumberId,
            user.waAccessToken,
            conversation.phone,
            dto.templateName!,
            dto.languageCode || 'pt_BR',
            dto.templateComponents,
          )
          break
      }
    } catch (error) {
      // Save message as failed
      const message = await this.prisma.message.create({
        data: {
          conversationId,
          content: dto.content,
          type: dto.type.toUpperCase(),
          direction: 'OUTBOUND',
          sender: 'HUMAN_AGENT',
          status: 'FAILED',
          mediaUrl: dto.mediaUrl,
        },
      })

      return { message, error: error.message }
    }

    // Save outgoing message
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        content: dto.content,
        type: dto.type.toUpperCase(),
        direction: 'OUTBOUND',
        sender: 'HUMAN_AGENT',
        status: 'SENT',
        mediaUrl: dto.mediaUrl,
        metaMessageId: sendResult.messages?.[0]?.id,
      },
    })

    // Update conversation
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: dto.content.substring(0, 100),
        lastMessageAt: new Date(),
      },
    })

    // Update lead last interaction
    await this.prisma.lead.update({
      where: { id: conversation.leadId },
      data: { lastInteraction: new Date() },
    })

    return message
  }

  // ================== BOT CONTROL ==================

  async toggleBot(conversationId: string, companyId: string, isActive: boolean) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, companyId },
    })

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada')
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { isBotActive: isActive },
    })
  }

  async toggleCoPilot(conversationId: string, companyId: string, isActive: boolean) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, companyId },
    })

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada')
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { aiAssistMode: isActive },
    })
  }

  async assumeConversation(conversationId: string, companyId: string) {
    // Turn off bot, enable co-pilot
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, companyId },
    })

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada')
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        isBotActive: false,
        aiAssistMode: true,
      },
    })
  }

  async reactivateBot(conversationId: string, companyId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, companyId },
    })

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada')
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        isBotActive: true,
        aiAssistMode: false,
      },
    })
  }

  // ================== READ STATUS ==================

  async markAsRead(conversationId: string, companyId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, companyId },
    })

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada')
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 },
    })
  }

  async markAsUnread(conversationId: string, companyId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, companyId },
    })

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada')
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 1 },
    })
  }

  // ================== AI SUGGESTIONS ==================

  async useSuggestion(suggestionId: string, companyId: string, edited: boolean = false) {
    const suggestion = await this.prisma.aiSuggestion.findFirst({
      where: { id: suggestionId },
      include: { conversation: true },
    })

    if (!suggestion || suggestion.conversation.companyId !== companyId) {
      throw new NotFoundException('Sugestão não encontrada')
    }

    return this.prisma.aiSuggestion.update({
      where: { id: suggestionId },
      data: {
        used: true,
        usedAt: new Date(),
        editedBeforeSend: edited,
      },
    })
  }

  async dismissSuggestion(suggestionId: string, companyId: string) {
    const suggestion = await this.prisma.aiSuggestion.findFirst({
      where: { id: suggestionId },
      include: { conversation: true },
    })

    if (!suggestion || suggestion.conversation.companyId !== companyId) {
      throw new NotFoundException('Sugestão não encontrada')
    }

    return this.prisma.aiSuggestion.delete({
      where: { id: suggestionId },
    })
  }

  async getSuggestions(conversationId: string, companyId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, companyId },
    })

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada')
    }

    return this.prisma.aiSuggestion.findMany({
      where: { conversationId, used: false },
      orderBy: { createdAt: 'desc' },
    })
  }

  // ================== STATS ==================

  async getStats(companyId: string, userId?: string) {
    const where: any = { companyId }
    if (userId) where.userId = userId

    const [total, unread, botActive, humanActive] = await Promise.all([
      this.prisma.conversation.count({ where }),
      this.prisma.conversation.count({ where: { ...where, unreadCount: { gt: 0 } } }),
      this.prisma.conversation.count({ where: { ...where, isBotActive: true } }),
      this.prisma.conversation.count({ where: { ...where, isBotActive: false } }),
    ])

    return { total, unread, botActive, humanActive }
  }
}
