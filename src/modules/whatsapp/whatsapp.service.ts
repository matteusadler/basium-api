import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { PrismaService } from '../../common/prisma/prisma.service'
import axios from 'axios'
import * as crypto from 'crypto'

// Meta Cloud API Base URL
const META_API_BASE = 'https://graph.facebook.com/v19.0'

export interface WhatsappConfig {
  phoneNumberId: string
  wabaId: string
  accessToken: string
  waPhone: string
}

export interface IncomingMessage {
  from: string
  timestamp: string
  type: string
  text?: { body: string }
  image?: { id: string; mime_type: string; sha256: string; caption?: string }
  document?: { id: string; mime_type: string; sha256: string; filename: string; caption?: string }
  audio?: { id: string; mime_type: string; sha256: string }
  video?: { id: string; mime_type: string; sha256: string; caption?: string }
  sticker?: { id: string; mime_type: string; sha256: string }
  location?: { latitude: number; longitude: number; name?: string; address?: string }
  contacts?: any[]
  button?: { text: string; payload: string }
  interactive?: any
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name)

  constructor(
    private prisma: PrismaService,
    @InjectQueue('whatsapp') private whatsappQueue: Queue,
  ) {}

  // ================== WEBHOOK VERIFICATION ==================

  verifyWebhook(mode: string, token: string, challenge: string): string {
    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Webhook verified successfully')
      return challenge
    }

    throw new BadRequestException('Webhook verification failed')
  }

  // ================== WEBHOOK HANDLER ==================

  async handleWebhook(payload: any, signature: string): Promise<void> {
    // Verify signature (HMAC SHA256)
    if (!this.verifySignature(payload, signature)) {
      this.logger.warn('Invalid webhook signature')
      throw new BadRequestException('Invalid signature')
    }

    // Process each entry in the webhook payload
    const entries = payload.entry || []

    for (const entry of entries) {
      const changes = entry.changes || []

      for (const change of changes) {
        if (change.field === 'messages') {
          const value = change.value

          // Extract phoneNumberId for multi-tenant routing
          const phoneNumberId = value.metadata?.phone_number_id

          if (!phoneNumberId) {
            this.logger.warn('Webhook missing phoneNumberId')
            continue
          }

          // Process messages
          const messages = value.messages || []
          for (const message of messages) {
            await this.enqueueMessage(phoneNumberId, message, value.contacts?.[0])
          }

          // Process status updates (delivery receipts)
          const statuses = value.statuses || []
          for (const status of statuses) {
            await this.processStatusUpdate(phoneNumberId, status)
          }
        }
      }
    }
  }

  private verifySignature(payload: any, signature: string): boolean {
    const appSecret = process.env.META_APP_SECRET
    if (!appSecret) {
      this.logger.warn('META_APP_SECRET not configured - skipping signature verification')
      return true // Allow in development
    }

    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(JSON.stringify(payload))
      .digest('hex')

    const providedSignature = signature?.replace('sha256=', '') || ''
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(providedSignature),
    )
  }

  private async enqueueMessage(
    phoneNumberId: string,
    message: IncomingMessage,
    contact: any,
  ): Promise<void> {
    await this.whatsappQueue.add(
      'process-message',
      {
        phoneNumberId,
        message,
        contact,
        receivedAt: new Date().toISOString(),
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    )
  }

  private async processStatusUpdate(phoneNumberId: string, status: any): Promise<void> {
    const metaMessageId = status.id
    const newStatus = status.status // sent, delivered, read, failed

    try {
      await this.prisma.message.updateMany({
        where: { metaMessageId },
        data: {
          status: newStatus.toUpperCase(),
        },
      })
    } catch (error) {
      this.logger.error(`Failed to update message status: ${error.message}`)
    }
  }

  // ================== MULTI-TENANT ROUTING ==================

  async getUserByPhoneNumberId(phoneNumberId: string) {
    const user = await this.prisma.user.findFirst({
      where: { phoneNumberId },
      include: {
        company: true,
      },
    })

    if (!user) {
      throw new NotFoundException(`No user found for phoneNumberId: ${phoneNumberId}`)
    }

    return user
  }

  // ================== SEND MESSAGES ==================

  async sendTextMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    text: string,
  ): Promise<any> {
    const url = `${META_API_BASE}/${phoneNumberId}/messages`

    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return response.data
  }

  async sendImageMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    imageUrl: string,
    caption?: string,
  ): Promise<any> {
    const url = `${META_API_BASE}/${phoneNumberId}/messages`

    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'image',
        image: {
          link: imageUrl,
          caption,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return response.data
  }

  async sendDocumentMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    documentUrl: string,
    filename: string,
    caption?: string,
  ): Promise<any> {
    const url = `${META_API_BASE}/${phoneNumberId}/messages`

    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'document',
        document: {
          link: documentUrl,
          filename,
          caption,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return response.data
  }

  async sendTemplateMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    templateName: string,
    languageCode: string,
    components?: any[],
  ): Promise<any> {
    const url = `${META_API_BASE}/${phoneNumberId}/messages`

    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return response.data
  }

  async sendInteractiveButtons(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    headerText?: string,
    footerText?: string,
  ): Promise<any> {
    const url = `${META_API_BASE}/${phoneNumberId}/messages`

    const interactive: any = {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.map(btn => ({
          type: 'reply',
          reply: { id: btn.id, title: btn.title },
        })),
      },
    }

    if (headerText) interactive.header = { type: 'text', text: headerText }
    if (footerText) interactive.footer = { text: footerText }

    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return response.data
  }

  // ================== MEDIA DOWNLOAD ==================

  async getMediaUrl(mediaId: string, accessToken: string): Promise<string> {
    const response = await axios.get(`${META_API_BASE}/${mediaId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    return response.data.url
  }

  async downloadMedia(mediaUrl: string, accessToken: string): Promise<Buffer> {
    const response = await axios.get(mediaUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: 'arraybuffer',
    })

    return Buffer.from(response.data)
  }

  // ================== EMBEDDED SIGNUP (OAuth) ==================

  async handleEmbeddedSignupCallback(
    userId: string,
    code: string,
  ): Promise<any> {
    // Exchange code for access token
    const tokenResponse = await axios.get(
      `https://graph.facebook.com/v19.0/oauth/access_token`,
      {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          code,
        },
      },
    )

    const accessToken = tokenResponse.data.access_token

    // Get WABA ID and phone number info
    const wabaResponse = await axios.get(
      `https://graph.facebook.com/v19.0/debug_token`,
      {
        params: {
          input_token: accessToken,
          access_token: `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`,
        },
      },
    )

    // Get phone numbers associated with the WABA
    const granularScopes = wabaResponse.data.data?.granular_scopes || []
    const wabaScope = granularScopes.find(
      (s: any) => s.scope === 'whatsapp_business_management',
    )

    if (!wabaScope?.target_ids?.length) {
      throw new BadRequestException('No WhatsApp Business Account found')
    }

    const wabaId = wabaScope.target_ids[0]

    // Get phone numbers for this WABA
    const phonesResponse = await axios.get(
      `${META_API_BASE}/${wabaId}/phone_numbers`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )

    const phoneNumbers = phonesResponse.data.data || []
    if (!phoneNumbers.length) {
      throw new BadRequestException('No phone numbers found in WhatsApp Business Account')
    }

    const primaryPhone = phoneNumbers[0]

    // Update user with WhatsApp credentials
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        wabaId,
        phoneNumberId: primaryPhone.id,
        waAccessToken: accessToken, // Should be encrypted in production
        waPhone: primaryPhone.display_phone_number,
        waConnectedAt: new Date(),
      },
    })

    return {
      success: true,
      wabaId,
      phoneNumberId: primaryPhone.id,
      phoneNumber: primaryPhone.display_phone_number,
    }
  }

  async disconnectWhatsApp(userId: string, companyId: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, companyId },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        wabaId: null,
        phoneNumberId: null,
        waAccessToken: null,
        waPhone: null,
        waConnectedAt: null,
      },
    })
  }

  // ================== WHATSAPP STATUS ==================

  async getWhatsAppStatus(userId: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, companyId },
      select: {
        phoneNumberId: true,
        waPhone: true,
        waConnectedAt: true,
        wabaId: true,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return {
      connected: !!user.phoneNumberId,
      phoneNumber: user.waPhone,
      connectedAt: user.waConnectedAt,
      wabaId: user.wabaId,
    }
  }

  // ================== TEMPLATES MANAGEMENT ==================

  async getMessageTemplates(wabaId: string, accessToken: string): Promise<any[]> {
    const response = await axios.get(
      `${META_API_BASE}/${wabaId}/message_templates`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )

    return response.data.data || []
  }

  async createMessageTemplate(
    wabaId: string,
    accessToken: string,
    template: any,
  ): Promise<any> {
    const response = await axios.post(
      `${META_API_BASE}/${wabaId}/message_templates`,
      template,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return response.data
  }
}
