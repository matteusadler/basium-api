import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  RawBodyRequest,
  Req,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { FastifyRequest } from 'fastify'
import { WhatsappService } from './whatsapp.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { SendMessageDto } from './dto/send-message.dto'

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private whatsappService: WhatsappService) {}

  // ================== WEBHOOK ENDPOINTS (Public) ==================

  @Get('webhook')
  @ApiOperation({ summary: 'Meta webhook verification (GET)' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): string {
    return this.whatsappService.verifyWebhook(mode, token, challenge)
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Meta webhook receiver (POST)' })
  async handleWebhook(
    @Body() body: any,
    @Headers('x-hub-signature-256') signature: string,
  ): Promise<{ status: string }> {
    // Must respond quickly (< 5s) to Meta
    await this.whatsappService.handleWebhook(body, signature)
    return { status: 'ok' }
  }

  // ================== AUTHENTICATED ENDPOINTS ==================

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get WhatsApp connection status' })
  async getStatus(@CurrentUser() user: any) {
    return this.whatsappService.getWhatsAppStatus(user.sub, user.companyId)
  }

  @Post('connect/callback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Handle Embedded Signup callback' })
  async handleEmbeddedSignupCallback(
    @CurrentUser() user: any,
    @Body() body: { code: string },
  ) {
    return this.whatsappService.handleEmbeddedSignupCallback(user.sub, body.code)
  }

  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect WhatsApp' })
  async disconnect(@CurrentUser() user: any) {
    await this.whatsappService.disconnectWhatsApp(user.sub, user.companyId)
    return { success: true }
  }

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send WhatsApp message' })
  async sendMessage(
    @CurrentUser() user: any,
    @Body() dto: SendMessageDto,
  ) {
    // Get user's WhatsApp config
    const userData = await this.whatsappService.getUserByPhoneNumberId(user.phoneNumberId)

    if (!userData.phoneNumberId || !userData.waAccessToken) {
      return { error: 'WhatsApp not connected' }
    }

    let result: any

    switch (dto.type) {
      case 'text':
        result = await this.whatsappService.sendTextMessage(
          userData.phoneNumberId,
          userData.waAccessToken,
          dto.to,
          dto.text!,
        )
        break

      case 'image':
        result = await this.whatsappService.sendImageMessage(
          userData.phoneNumberId,
          userData.waAccessToken,
          dto.to,
          dto.mediaUrl!,
          dto.caption,
        )
        break

      case 'document':
        result = await this.whatsappService.sendDocumentMessage(
          userData.phoneNumberId,
          userData.waAccessToken,
          dto.to,
          dto.mediaUrl!,
          dto.filename!,
          dto.caption,
        )
        break

      case 'template':
        result = await this.whatsappService.sendTemplateMessage(
          userData.phoneNumberId,
          userData.waAccessToken,
          dto.to,
          dto.templateName!,
          dto.languageCode || 'pt_BR',
          dto.templateComponents,
        )
        break

      default:
        return { error: 'Invalid message type' }
    }

    return result
  }

  @Get('templates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get WhatsApp message templates' })
  async getTemplates(@CurrentUser() user: any) {
    const userData = await this.whatsappService.getUserByPhoneNumberId(user.phoneNumberId)

    if (!userData.wabaId || !userData.waAccessToken) {
      return { templates: [], error: 'WhatsApp not connected' }
    }

    const templates = await this.whatsappService.getMessageTemplates(
      userData.wabaId,
      userData.waAccessToken,
    )

    return { templates }
  }
}
