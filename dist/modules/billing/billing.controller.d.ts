import { RawBodyRequest } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { BillingService } from './billing.service';
import { CreateCheckoutSessionDto, CreatePortalSessionDto } from './dto/billing.dto';
export declare class BillingController {
    private billingService;
    constructor(billingService: BillingService);
    getPlans(): Promise<{
        id: string;
        name: string;
        stripePriceIdMonthly: string;
        stripePriceIdYearly: string;
        maxLeads: number;
        maxUsers: number;
        maxWhatsappNumbers: number;
        maxPipelines: number;
        maxFlows: number;
        maxFlowExecutions: number;
        storageGb: number;
        hasAi: boolean;
        hasCopilot: boolean;
        hasFlowBuilder: boolean;
        hasPortals: boolean;
        trialDays: number;
    }[]>;
    getSubscription(user: any): Promise<{
        company: {
            id: string;
            name: string;
            planStatus: import(".prisma/client").$Enums.PlanStatus;
            trialEndsAt: Date;
        };
        plan: {
            id: string;
            name: string;
            stripePriceIdMonthly: string;
            stripePriceIdYearly: string;
            maxLeads: number;
            maxUsers: number;
            maxWhatsappNumbers: number;
            maxPipelines: number;
            maxFlows: number;
            maxFlowExecutions: number;
            storageGb: number;
            hasAi: boolean;
            hasCopilot: boolean;
            hasFlowBuilder: boolean;
            hasPortals: boolean;
            trialDays: number;
        };
        subscription: {
            id: string;
            companyId: string;
            createdAt: Date;
            stripeSubId: string;
            status: import(".prisma/client").$Enums.SubStatus;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            cancelAtPeriodEnd: boolean;
        };
        usage: {
            id: string;
            companyId: string;
            updatedAt: Date;
            leadsCount: number;
            usersCount: number;
            propertiesCount: number;
            contractsCount: number;
            activeFlows: number;
            flowExecMonth: number;
            storageBytes: bigint;
            pdfCount: number;
        };
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
