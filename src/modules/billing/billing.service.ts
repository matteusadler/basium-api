import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateCheckoutSessionDto, CreatePortalSessionDto, PaymentMethod } from './dto/billing.dto'

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name)
  private stripe: Stripe | null = null

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const stripeKey = this.config.get<string>('STRIPE_SECRET_KEY')
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2023-10-16',
      })
      this.logger.log('Stripe initialized')
    } else {
      this.logger.warn('STRIPE_SECRET_KEY not configured - billing features disabled')
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Plans
  // ════════════════════════════════════════════════════════════════════════

  async getPlans() {
    return this.prisma.plan.findMany({
      orderBy: { maxLeads: 'asc' },
    })
  }

  async getPlan(planId: string) {
    return this.prisma.plan.findUnique({
      where: { id: planId },
    })
  }

  // ════════════════════════════════════════════════════════════════════════
  // Subscription Info
  // ════════════════════════════════════════════════════════════════════════

  async getSubscription(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { usage: true },
    })

    if (!company) {
      throw new NotFoundException('Empresa não encontrada')
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: company.planId },
    })

    const subscription = await this.prisma.subscription.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    })

    return {
      company: {
        id: company.id,
        name: company.name,
        planStatus: company.planStatus,
        trialEndsAt: company.trialEndsAt,
      },
      plan,
      subscription,
      usage: company.usage,
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Checkout Session
  // ════════════════════════════════════════════════════════════════════════

  async createCheckoutSession(companyId: string, dto: CreateCheckoutSessionDto) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe não configurado')
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    })

    if (!company) {
      throw new NotFoundException('Empresa não encontrada')
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: dto.planId },
    })

    if (!plan) {
      throw new NotFoundException('Plano não encontrado')
    }

    // Get or create Stripe customer
    let customerId = company.stripeCustomerId

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        metadata: { companyId },
      })
      customerId = customer.id

      await this.prisma.company.update({
        where: { id: companyId },
        data: { stripeCustomerId: customerId },
      })
    }

    // Get price ID
    const priceId = dto.yearly
      ? plan.stripePriceIdYearly
      : plan.stripePriceIdMonthly

    // Configure payment methods based on preference
    // Stripe BR supports: card, boleto, apple_pay, google_pay
    // PIX not available in this configuration
    let paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = ['card']

    if (dto.paymentMethod === PaymentMethod.BOLETO) {
      paymentMethodTypes = ['boleto']
    } else {
      // Card includes Apple Pay and Google Pay when enabled in Stripe dashboard
      paymentMethodTypes = ['card']
    }

    const baseUrl = this.config.get('APP_URL') || 'http://localhost:3000'

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: dto.successUrl || `${baseUrl}/billing?success=true`,
      cancel_url: dto.cancelUrl || `${baseUrl}/billing?cancelled=true`,
      metadata: {
        companyId,
        planId: dto.planId,
      },
      subscription_data: {
        metadata: {
          companyId,
          planId: dto.planId,
        },
      },
      // Enable automatic tax for Brazil if configured
      // automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    })

    this.logger.log(`Checkout session created: ${session.id} for company ${companyId}`)

    return {
      sessionId: session.id,
      url: session.url,
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Customer Portal Session
  // ════════════════════════════════════════════════════════════════════════

  async createPortalSession(companyId: string, dto: CreatePortalSessionDto) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe não configurado')
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    })

    if (!company?.stripeCustomerId) {
      throw new BadRequestException('Empresa não possui cadastro no Stripe')
    }

    const baseUrl = this.config.get('APP_URL') || 'http://localhost:3000'

    const session = await this.stripe.billingPortal.sessions.create({
      customer: company.stripeCustomerId,
      return_url: dto.returnUrl || `${baseUrl}/billing`,
    })

    return {
      url: session.url,
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Webhooks - The 4 required events
  // ════════════════════════════════════════════════════════════════════════

  async handleWebhook(payload: Buffer, signature: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe não configurado')
    }

    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET não configurado')
    }

    let event: Stripe.Event

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`)
      throw new BadRequestException(`Webhook Error: ${err.message}`)
    }

    this.logger.log(`Processing webhook event: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      default:
        this.logger.log(`Unhandled event type: ${event.type}`)
    }

    return { received: true }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Webhook Handlers
  // ════════════════════════════════════════════════════════════════════════

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const companyId = session.metadata?.companyId
    const planId = session.metadata?.planId
    const subscriptionId = session.subscription as string

    if (!companyId || !subscriptionId) {
      this.logger.warn('Missing companyId or subscriptionId in checkout session')
      return
    }

    this.logger.log(`Checkout completed for company ${companyId}`)

    // Get subscription details from Stripe
    const subscription = await this.stripe!.subscriptions.retrieve(subscriptionId)

    // Update company
    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        planId: planId || undefined,
        planStatus: 'ACTIVE',
        stripeSubId: subscriptionId,
        trialEndsAt: null,
      },
    })

    // Create or update subscription record
    await this.prisma.subscription.upsert({
      where: { stripeSubId: subscriptionId },
      update: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      create: {
        companyId,
        stripeSubId: subscriptionId,
        status: 'ACTIVE',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    })

    this.logger.log(`Company ${companyId} activated with plan ${planId}`)
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string
    if (!subscriptionId) return

    this.logger.log(`Invoice paid for subscription ${subscriptionId}`)

    // Find subscription in our database
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubId: subscriptionId },
    })

    if (!subscription) {
      this.logger.warn(`Subscription ${subscriptionId} not found in database`)
      return
    }

    // Get subscription details from Stripe
    const stripeSubscription = await this.stripe!.subscriptions.retrieve(subscriptionId)

    // Update subscription period
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      },
    })

    // Update company status
    await this.prisma.company.update({
      where: { id: subscription.companyId },
      data: { planStatus: 'ACTIVE' },
    })

    this.logger.log(`Subscription ${subscriptionId} renewed successfully`)
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string
    if (!subscriptionId) return

    this.logger.log(`Invoice payment failed for subscription ${subscriptionId}`)

    // Find subscription in our database
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubId: subscriptionId },
    })

    if (!subscription) {
      this.logger.warn(`Subscription ${subscriptionId} not found in database`)
      return
    }

    // Update subscription status
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'PAST_DUE' },
    })

    // Update company status
    await this.prisma.company.update({
      where: { id: subscription.companyId },
      data: { planStatus: 'OVERDUE' },
    })

    // TODO: Send notification email to company admin

    this.logger.log(`Company ${subscription.companyId} marked as OVERDUE`)
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const subscriptionId = subscription.id

    this.logger.log(`Subscription ${subscriptionId} deleted/cancelled`)

    // Find subscription in our database
    const dbSubscription = await this.prisma.subscription.findFirst({
      where: { stripeSubId: subscriptionId },
    })

    if (!dbSubscription) {
      this.logger.warn(`Subscription ${subscriptionId} not found in database`)
      return
    }

    // Update subscription status
    await this.prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: { status: 'CANCELLED' },
    })

    // Update company status
    await this.prisma.company.update({
      where: { id: dbSubscription.companyId },
      data: {
        planStatus: 'CANCELLED',
        stripeSubId: null,
      },
    })

    this.logger.log(`Company ${dbSubscription.companyId} subscription cancelled`)
  }

  // ════════════════════════════════════════════════════════════════════════
  // Utilities
  // ════════════════════════════════════════════════════════════════════════

  async getInvoices(companyId: string, limit = 10) {
    if (!this.stripe) {
      return []
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    })

    if (!company?.stripeCustomerId) {
      return []
    }

    const invoices = await this.stripe.invoices.list({
      customer: company.stripeCustomerId,
      limit,
    })

    return invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      status: invoice.status,
      paidAt: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : null,
      invoicePdf: invoice.invoice_pdf,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
    }))
  }

  async cancelSubscription(companyId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe não configurado')
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    })

    if (!company?.stripeSubId) {
      throw new BadRequestException('Empresa não possui assinatura ativa')
    }

    // Cancel at period end (user keeps access until end of billing period)
    await this.stripe.subscriptions.update(company.stripeSubId, {
      cancel_at_period_end: true,
    })

    await this.prisma.subscription.updateMany({
      where: { companyId, stripeSubId: company.stripeSubId },
      data: { cancelAtPeriodEnd: true },
    })

    this.logger.log(`Subscription for company ${companyId} set to cancel at period end`)

    return { message: 'Assinatura será cancelada ao final do período atual' }
  }
}
