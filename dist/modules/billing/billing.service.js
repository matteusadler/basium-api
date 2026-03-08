"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const billing_dto_1 = require("./dto/billing.dto");
let BillingService = BillingService_1 = class BillingService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.logger = new common_1.Logger(BillingService_1.name);
        this.stripe = null;
        const stripeKey = this.config.get('STRIPE_SECRET_KEY');
        if (stripeKey) {
            this.stripe = new stripe_1.default(stripeKey, {
                apiVersion: '2023-10-16',
            });
            this.logger.log('Stripe initialized');
        }
        else {
            this.logger.warn('STRIPE_SECRET_KEY not configured - billing features disabled');
        }
    }
    async getPlans() {
        return this.prisma.plan.findMany({
            orderBy: { maxLeads: 'asc' },
        });
    }
    async getPlan(planId) {
        return this.prisma.plan.findUnique({
            where: { id: planId },
        });
    }
    async getSubscription(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            include: { usage: true },
        });
        if (!company) {
            throw new common_1.NotFoundException('Empresa não encontrada');
        }
        const plan = await this.prisma.plan.findUnique({
            where: { id: company.planId },
        });
        const subscription = await this.prisma.subscription.findFirst({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
        });
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
        };
    }
    async createCheckoutSession(companyId, dto) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe não configurado');
        }
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company) {
            throw new common_1.NotFoundException('Empresa não encontrada');
        }
        const plan = await this.prisma.plan.findUnique({
            where: { id: dto.planId },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plano não encontrado');
        }
        let customerId = company.stripeCustomerId;
        if (!customerId) {
            const customer = await this.stripe.customers.create({
                metadata: { companyId },
            });
            customerId = customer.id;
            await this.prisma.company.update({
                where: { id: companyId },
                data: { stripeCustomerId: customerId },
            });
        }
        const priceId = dto.yearly
            ? plan.stripePriceIdYearly
            : plan.stripePriceIdMonthly;
        let paymentMethodTypes = ['card'];
        if (dto.paymentMethod === billing_dto_1.PaymentMethod.BOLETO) {
            paymentMethodTypes = ['boleto'];
        }
        else {
            paymentMethodTypes = ['card'];
        }
        const baseUrl = this.config.get('APP_URL') || 'http://localhost:3000';
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
            allow_promotion_codes: true,
            billing_address_collection: 'required',
        });
        this.logger.log(`Checkout session created: ${session.id} for company ${companyId}`);
        return {
            sessionId: session.id,
            url: session.url,
        };
    }
    async createPortalSession(companyId, dto) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe não configurado');
        }
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company?.stripeCustomerId) {
            throw new common_1.BadRequestException('Empresa não possui cadastro no Stripe');
        }
        const baseUrl = this.config.get('APP_URL') || 'http://localhost:3000';
        const session = await this.stripe.billingPortal.sessions.create({
            customer: company.stripeCustomerId,
            return_url: dto.returnUrl || `${baseUrl}/billing`,
        });
        return {
            url: session.url,
        };
    }
    async handleWebhook(payload, signature) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe não configurado');
        }
        const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new common_1.BadRequestException('STRIPE_WEBHOOK_SECRET não configurado');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new common_1.BadRequestException(`Webhook Error: ${err.message}`);
        }
        this.logger.log(`Processing webhook event: ${event.type}`);
        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutCompleted(event.data.object);
                break;
            case 'invoice.paid':
                await this.handleInvoicePaid(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.handleInvoicePaymentFailed(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            default:
                this.logger.log(`Unhandled event type: ${event.type}`);
        }
        return { received: true };
    }
    async handleCheckoutCompleted(session) {
        const companyId = session.metadata?.companyId;
        const planId = session.metadata?.planId;
        const subscriptionId = session.subscription;
        if (!companyId || !subscriptionId) {
            this.logger.warn('Missing companyId or subscriptionId in checkout session');
            return;
        }
        this.logger.log(`Checkout completed for company ${companyId}`);
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        await this.prisma.company.update({
            where: { id: companyId },
            data: {
                planId: planId || undefined,
                planStatus: 'ACTIVE',
                stripeSubId: subscriptionId,
                trialEndsAt: null,
            },
        });
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
        });
        this.logger.log(`Company ${companyId} activated with plan ${planId}`);
    }
    async handleInvoicePaid(invoice) {
        const subscriptionId = invoice.subscription;
        if (!subscriptionId)
            return;
        this.logger.log(`Invoice paid for subscription ${subscriptionId}`);
        const subscription = await this.prisma.subscription.findFirst({
            where: { stripeSubId: subscriptionId },
        });
        if (!subscription) {
            this.logger.warn(`Subscription ${subscriptionId} not found in database`);
            return;
        }
        const stripeSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                status: 'ACTIVE',
                currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            },
        });
        await this.prisma.company.update({
            where: { id: subscription.companyId },
            data: { planStatus: 'ACTIVE' },
        });
        this.logger.log(`Subscription ${subscriptionId} renewed successfully`);
    }
    async handleInvoicePaymentFailed(invoice) {
        const subscriptionId = invoice.subscription;
        if (!subscriptionId)
            return;
        this.logger.log(`Invoice payment failed for subscription ${subscriptionId}`);
        const subscription = await this.prisma.subscription.findFirst({
            where: { stripeSubId: subscriptionId },
        });
        if (!subscription) {
            this.logger.warn(`Subscription ${subscriptionId} not found in database`);
            return;
        }
        await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'PAST_DUE' },
        });
        await this.prisma.company.update({
            where: { id: subscription.companyId },
            data: { planStatus: 'OVERDUE' },
        });
        this.logger.log(`Company ${subscription.companyId} marked as OVERDUE`);
    }
    async handleSubscriptionDeleted(subscription) {
        const subscriptionId = subscription.id;
        this.logger.log(`Subscription ${subscriptionId} deleted/cancelled`);
        const dbSubscription = await this.prisma.subscription.findFirst({
            where: { stripeSubId: subscriptionId },
        });
        if (!dbSubscription) {
            this.logger.warn(`Subscription ${subscriptionId} not found in database`);
            return;
        }
        await this.prisma.subscription.update({
            where: { id: dbSubscription.id },
            data: { status: 'CANCELLED' },
        });
        await this.prisma.company.update({
            where: { id: dbSubscription.companyId },
            data: {
                planStatus: 'CANCELLED',
                stripeSubId: null,
            },
        });
        this.logger.log(`Company ${dbSubscription.companyId} subscription cancelled`);
    }
    async getInvoices(companyId, limit = 10) {
        if (!this.stripe) {
            return [];
        }
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company?.stripeCustomerId) {
            return [];
        }
        const invoices = await this.stripe.invoices.list({
            customer: company.stripeCustomerId,
            limit,
        });
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
        }));
    }
    async cancelSubscription(companyId) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe não configurado');
        }
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company?.stripeSubId) {
            throw new common_1.BadRequestException('Empresa não possui assinatura ativa');
        }
        await this.stripe.subscriptions.update(company.stripeSubId, {
            cancel_at_period_end: true,
        });
        await this.prisma.subscription.updateMany({
            where: { companyId, stripeSubId: company.stripeSubId },
            data: { cancelAtPeriodEnd: true },
        });
        this.logger.log(`Subscription for company ${companyId} set to cancel at period end`);
        return { message: 'Assinatura será cancelada ao final do período atual' };
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = BillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], BillingService);
//# sourceMappingURL=billing.service.js.map