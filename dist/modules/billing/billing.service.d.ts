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
    getPlan(planId: string): Promise<{
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
    }>;
    getSubscription(companyId: string): Promise<{
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
