import { RawBodyRequest } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { BillingService } from './billing.service';
import { CreateCheckoutSessionDto, CreatePortalSessionDto } from './dto/billing.dto';
export declare class BillingController {
    private billingService;
    constructor(billingService: BillingService);
    getPlans(): Promise<any>;
    getSubscription(user: any): Promise<{
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
    getInvoices(user: any, limit?: number): Promise<{
        id: string;
        number: string;
        amount: number;
        currency: string;
        status: import("stripe").Stripe.Invoice.Status;
        paidAt: Date;
        invoicePdf: string;
        hostedInvoiceUrl: string;
    }[]>;
    createCheckoutSession(dto: CreateCheckoutSessionDto, user: any): Promise<{
        sessionId: string;
        url: string;
    }>;
    createPortalSession(dto: CreatePortalSessionDto, user: any): Promise<{
        url: string;
    }>;
    cancelSubscription(user: any): Promise<{
        message: string;
    }>;
    handleWebhook(req: RawBodyRequest<FastifyRequest>, signature: string): Promise<{
        received: boolean;
    }>;
}
