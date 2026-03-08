import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../../../common/prisma/prisma.service'
import axios from 'axios'

interface SendMessageJob {
  executionId: string
  phone: string
  type: string
  content: string
  mediaUrl?: string
  companyId: string
}

@Processor('flow-message', { connection: { host: 'localhost', port: 6379 } })
export class FlowMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(FlowMessageProcessor.name)

  constructor(private prisma: PrismaService) {
    super()
  }

  async process(job: Job<SendMessageJob>): Promise<any> {
    const { executionId, phone, type, content, mediaUrl, companyId } = job.data

    this.logger.log(`Sending message to ${phone} for execution ${executionId}`)

    try {
      // Get execution to find the lead's assigned user (who has WhatsApp config)
      const execution = await this.prisma.flowExecution.findUnique({
        where: { id: executionId },
        include: {
          lead: {
            include: {
              company: true,
            },
          },
        },
      })

      if (!execution) {
        throw new Error('Execution not found')
      }

      // Get the user who owns this lead (they have WhatsApp config)
      const user = await this.prisma.user.findUnique({
        where: { id: execution.lead.userId },
      })

      if (!user?.phoneNumberId || !user?.waAccessToken) {
        this.logger.warn(`User ${execution.lead.userId} has no WhatsApp configuration`)
        return {
          status: 'skipped',
          reason: 'no_whatsapp_config',
          phone,
        }
      }

      // Send message via Meta Cloud API
      const result = await this.sendWhatsAppMessage(
        user.phoneNumberId,
        user.waAccessToken,
        phone,
        type,
        content,
        mediaUrl,
      )

      // Create message record in conversation
      const conversation = await this.prisma.conversation.findFirst({
        where: {
          leadId: execution.leadId,
          phone,
        },
      })

      if (conversation) {
        await this.prisma.message.create({
          data: {
            conversationId: conversation.id,
            content,
            type: type.toLowerCase(),
            direction: 'OUTBOUND',
            sender: 'FLOW',
            status: 'SENT',
            mediaUrl,
            metaMessageId: result.messageId,
          },
        })

        // Update conversation
        await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessage: content.substring(0, 100),
            lastMessageAt: new Date(),
          },
        })
      }

      this.logger.log(`Message sent successfully to ${phone}`)

      return {
        status: 'sent',
        phone,
        messageId: result.messageId,
      }

    } catch (error: any) {
      this.logger.error(`Failed to send message: ${error.message}`)

      return {
        status: 'failed',
        phone,
        error: error.message,
      }
    }
  }

  private async sendWhatsAppMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    type: string,
    content: string,
    mediaUrl?: string,
  ): Promise<{ messageId: string }> {
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`

    // Format phone number
    const formattedPhone = to.replace(/\D/g, '')

    let payload: any = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
    }

    switch (type.toUpperCase()) {
      case 'TEXT':
        payload.type = 'text'
        payload.text = { body: content }
        break

      case 'IMAGE':
        payload.type = 'image'
        payload.image = {
          link: mediaUrl,
          caption: content || undefined,
        }
        break

      case 'DOCUMENT':
        payload.type = 'document'
        payload.document = {
          link: mediaUrl,
          caption: content || undefined,
        }
        break

      case 'VIDEO':
        payload.type = 'video'
        payload.video = {
          link: mediaUrl,
          caption: content || undefined,
        }
        break

      case 'AUDIO':
        payload.type = 'audio'
        payload.audio = { link: mediaUrl }
        break

      default:
        payload.type = 'text'
        payload.text = { body: content }
    }

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      return {
        messageId: response.data.messages?.[0]?.id || 'unknown',
      }
    } catch (error: any) {
      this.logger.error(`WhatsApp API error: ${error.response?.data?.error?.message || error.message}`)
      throw new Error(error.response?.data?.error?.message || 'Failed to send WhatsApp message')
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Message job ${job.id} completed`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Message job ${job.id} failed: ${error.message}`)
  }
}
