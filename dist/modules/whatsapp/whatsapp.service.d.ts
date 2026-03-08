import { Queue } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';
export interface WhatsappConfig {
    phoneNumberId: string;
    wabaId: string;
    accessToken: string;
    waPhone: string;
}
export interface IncomingMessage {
    from: string;
    timestamp: string;
    type: string;
    text?: {
        body: string;
    };
    image?: {
        id: string;
        mime_type: string;
        sha256: string;
        caption?: string;
    };
    document?: {
        id: string;
        mime_type: string;
        sha256: string;
        filename: string;
        caption?: string;
    };
    audio?: {
        id: string;
        mime_type: string;
        sha256: string;
    };
    video?: {
        id: string;
        mime_type: string;
        sha256: string;
        caption?: string;
    };
    sticker?: {
        id: string;
        mime_type: string;
        sha256: string;
    };
    location?: {
        latitude: number;
        longitude: number;
        name?: string;
        address?: string;
    };
    contacts?: any[];
    button?: {
        text: string;
        payload: string;
    };
    interactive?: any;
}
export declare class WhatsappService {
    private prisma;
    private whatsappQueue;
    private readonly logger;
    constructor(prisma: PrismaService, whatsappQueue: Queue);
    verifyWebhook(mode: string, token: string, challenge: string): string;
    handleWebhook(payload: any, signature: string): Promise<void>;
    private verifySignature;
    private enqueueMessage;
    private processStatusUpdate;
    getUserByPhoneNumberId(phoneNumberId: string): Promise<{
        company: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            cnpj: string | null;
            logo: string | null;
            planId: string;
            planStatus: import(".prisma/client").$Enums.PlanStatus;
            trialEndsAt: Date | null;
            stripeCustomerId: string | null;
            stripeSubId: string | null;
        };
    } & {
        id: string;
        email: string;
        companyId: string;
        name: string;
        passwordHash: string | null;
        role: import(".prisma/client").$Enums.Role;
        avatarUrl: string | null;
        isActive: boolean;
        emailVerified: boolean;
        openaiKey: string | null;
        wabaId: string | null;
        phoneNumberId: string | null;
        waAccessToken: string | null;
        waPhone: string | null;
        waConnectedAt: Date | null;
        aiSystemPrompt: string | null;
        aiEnabled: boolean;
        aiWorkingHours: import("@prisma/client/runtime/library").JsonValue | null;
        aiMaxMessages: number;
        aiTransferKeywords: string[];
        pushSubscription: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    sendTextMessage(phoneNumberId: string, accessToken: string, to: string, text: string): Promise<any>;
    sendImageMessage(phoneNumberId: string, accessToken: string, to: string, imageUrl: string, caption?: string): Promise<any>;
    sendDocumentMessage(phoneNumberId: string, accessToken: string, to: string, documentUrl: string, filename: string, caption?: string): Promise<any>;
    sendTemplateMessage(phoneNumberId: string, accessToken: string, to: string, templateName: string, languageCode: string, components?: any[]): Promise<any>;
    sendInteractiveButtons(phoneNumberId: string, accessToken: string, to: string, bodyText: string, buttons: Array<{
        id: string;
        title: string;
    }>, headerText?: string, footerText?: string): Promise<any>;
    getMediaUrl(mediaId: string, accessToken: string): Promise<string>;
    downloadMedia(mediaUrl: string, accessToken: string): Promise<Buffer>;
    handleEmbeddedSignupCallback(userId: string, code: string): Promise<any>;
    disconnectWhatsApp(userId: string, companyId: string): Promise<void>;
    getWhatsAppStatus(userId: string, companyId: string): Promise<{
        connected: boolean;
        phoneNumber: string;
        connectedAt: Date;
        wabaId: string;
    }>;
    getMessageTemplates(wabaId: string, accessToken: string): Promise<any[]>;
    createMessageTemplate(wabaId: string, accessToken: string, template: any): Promise<any>;
}
