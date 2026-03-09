import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCheckoutSessionDto, CreatePortalSessionDto } from './dto/billing.dto';
export declare class BillingService {
    private prisma;
    private config;
    private readonly logger;
    private stripe;
    constructor(prisma: PrismaService, config: ConfigService);
    getPlans(): Promise<any>;
    getPlan(planId: string): Promise<any>;
    getSubscription(companyId: string): Promise<{
        company: {
            id: any;
            name: any;
            planStatus: any;
            trialEndsAt: any;
        };
        plan: any;
        subscription: any;
        usage: any;
    }>;
    createCheckoutSession(companyId: string, dto: CreateCheckoutSessionDto): Promise<{
        sessionId: string;
        url: string;
    }>;
    createPortalSession(companyId: string, dto: CreatePortalSessionDto): Promise<{
        url: string;
    }>;
    handleWebhook(payload: Buffer, signature: string): Promise<{
        received: boolean;
    }>;
    private handleCheckoutCompleted;
    private handleInvoicePaid;
    private handleInvoicePaymentFailed;
    private handleSubscriptionDeleted;
    getInvoices(companyId: string, limit?: number): Promise<{
        id: string;
        number: string;
        amount: number;
        currency: string;
        status: Stripe.Invoice.Status;
        paidAt: Date;
        invoicePdf: string;
        hostedInvoiceUrl: string;
    }[]>;
    cancelSubscription(companyId: string): Promise<{
        message: string;
    }>;
}
