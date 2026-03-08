import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  RawBodyRequest,
  Req,
  Headers,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger'
import { FastifyRequest } from 'fastify'
import { BillingService } from './billing.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import {
  CreateCheckoutSessionDto,
  CreatePortalSessionDto,
} from './dto/billing.dto'

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  // ════════════════════════════════════════════════════════════════════════
  // Plans (Public)
  // ════════════════════════════════════════════════════════════════════════

  @Get('plans')
  @ApiOperation({ summary: 'Listar planos disponíveis' })
  async getPlans() {
    return this.billingService.getPlans()
  }

  // ════════════════════════════════════════════════════════════════════════
  // Subscription (Authenticated)
  // ════════════════════════════════════════════════════════════════════════

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter informações da assinatura atual' })
  async getSubscription(@CurrentUser() user: any) {
    return this.billingService.getSubscription(user.companyId)
  }

  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar faturas' })
  async getInvoices(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
  ) {
    return this.billingService.getInvoices(user.companyId, limit)
  }

  // ════════════════════════════════════════════════════════════════════════
  // Checkout & Portal Sessions
  // ════════════════════════════════════════════════════════════════════════

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar sessão de checkout Stripe' })
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @CurrentUser() user: any,
  ) {
    return this.billingService.createCheckoutSession(user.companyId, dto)
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar sessão do portal do cliente Stripe' })
  async createPortalSession(
    @Body() dto: CreatePortalSessionDto,
    @CurrentUser() user: any,
  ) {
    return this.billingService.createPortalSession(user.companyId, dto)
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancelar assinatura' })
  async cancelSubscription(@CurrentUser() user: any) {
    return this.billingService.cancelSubscription(user.companyId)
  }

  // ════════════════════════════════════════════════════════════════════════
  // Stripe Webhook (No Auth - uses signature verification)
  // ════════════════════════════════════════════════════════════════════════

  @Post('webhook')
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Req() req: RawBodyRequest<FastifyRequest>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody
    if (!rawBody) {
      throw new Error('Raw body not available')
    }
    return this.billingService.handleWebhook(rawBody, signature)
  }
}
