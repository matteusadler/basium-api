import { PrismaService } from '../../common/prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { ConversationFiltersDto } from './dto/conversation-filters.dto';
import { SendMessageDto } from './dto/send-message.dto';
export declare class ConversationsService {
    private prisma;
    private whatsappService;
    constructor(prisma: PrismaService, whatsappService: WhatsappService);
    findAll(companyId: string, filters: ConversationFiltersDto): Promise<({
        lead: {
            stage: {
                name: string;
                color: string;
            };
            id: string;
            name: string;
            phone: string;
            temperature: import(".prisma/client").$Enums.Temperature;
        };
        messages: {
            id: string;
            createdAt: Date;
            type: string;
            status: import(".prisma/client").$Enums.MessageStatus;
            content: string;
            mediaUrl: string | null;
            direction: import(".prisma/client").$Enums.MessageDirection;
            sender: import(".prisma/client").$Enums.MessageSender;
            metaMessageId: string | null;
            conversationId: string;
        }[];
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        leadId: string;
        isBotActive: boolean;
        aiAssistMode: boolean;
        lastMessage: string | null;
        lastMessageAt: Date | null;
        unreadCount: number;
    })[]>;
    findOne(id: string, companyId: string): Promise<{
        lead: {
            pipeline: {
                name: string;
            };
            stage: {
                name: string;
                color: string;
            };
            id: string;
            name: string;
            email: string;
            tags: string[];
            phone: string;
            temperature: import(".prisma/client").$Enums.Temperature;
            priority: import(".prisma/client").$Enums.Priority;
        };
        messages: {
            id: string;
            createdAt: Date;
            type: string;
            status: import(".prisma/client").$Enums.MessageStatus;
            content: string;
            mediaUrl: string | null;
            direction: import(".prisma/client").$Enums.MessageDirection;
            sender: import(".prisma/client").$Enums.MessageSender;
            metaMessageId: string | null;
            conversationId: string;
        }[];
        aiSuggestions: {
            id: string;
            createdAt: Date;
            usedAt: Date | null;
            leadId: string;
            conversationId: string;
            suggestedText: string;
            suggestionType: import(".prisma/client").$Enums.SuggestionType;
            used: boolean;
            editedBeforeSend: boolean;
        }[];
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        leadId: string;
        isBotActive: boolean;
        aiAssistMode: boolean;
        lastMessage: string | null;
        lastMessageAt: Date | null;
        unreadCount: number;
    }>;
    findByPhone(companyId: string, phone: string): Promise<{
        lead: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        leadId: string;
        isBotActive: boolean;
        aiAssistMode: boolean;
        lastMessage: string | null;
        lastMessageAt: Date | null;
        unreadCount: number;
    }>;
    findByLead(companyId: string, leadId: string): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            type: string;
            status: import(".prisma/client").$Enums.MessageStatus;
            content: string;
            mediaUrl: string | null;
            direction: import(".prisma/client").$Enums.MessageDirection;
            sender: import(".prisma/client").$Enums.MessageSender;
            metaMessageId: string | null;
            conversationId: string;
        }[];
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        leadId: string;
        isBotActive: boolean;
        aiAssistMode: boolean;
        lastMessage: string | null;
        lastMessageAt: Date | null;
        unreadCount: number;
    }>;
    getMessages(conversationId: string, companyId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            type: string;
            status: import(".prisma/client").$Enums.MessageStatus;
            content: string;
            mediaUrl: string | null;
            direction: import(".prisma/client").$Enums.MessageDirection;
            sender: import(".prisma/client").$Enums.MessageSender;
            metaMessageId: string | null;
            conversationId: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    sendMessage(conversationId: string, companyId: string, userId: string, dto: SendMessageDto): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        status: import(".prisma/client").$Enums.MessageStatus;
        content: string;
        mediaUrl: string | null;
        direction: import(".prisma/client").$Enums.MessageDirection;
        sender: import(".prisma/client").$Enums.MessageSender;
        metaMessageId: string | null;
        conversationId: string;
    } | {
        message: {
            id: string;
            createdAt: Date;
            type: string;
            status: import(".prisma/client").$Enums.MessageStatus;
            content: string;
            mediaUrl: string | null;
            direction: import(".prisma/client").$Enums.MessageDirection;
            sender: import(".prisma/client").$Enums.MessageSender;
            metaMessageId: string | null;
            conversationId: string;
        };
        error: any;
    }>;
    toggleBot(conversationId: string, companyId: string, isActive: boolean): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        leadId: string;
        isBotActive: boolean;
        aiAssistMode: boolean;
        lastMessage: string | null;
        lastMessageAt: Date | null;
        unreadCount: number;
    }>;
    toggleCoPilot(conversationId: string, companyId: string, isActive: boolean): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        leadId: string;
        isBotActive: boolean;
        aiAssistMode: boolean;
        lastMessage: string | null;
        lastMessageAt: Date | null;
        unreadCount: number;
    }>;
    assumeConversation(conversationId: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        leadId: string;
        isBotActive: boolean;
        aiAssistMode: boolean;
        lastMessage: string | null;
        lastMessageAt: Date | null;
        unreadCount: number;
    }>;
    reactivateBot(conversationId: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        leadId: string;
        isBotActive: boolean;
        aiAssistMode: boolean;
        lastMessage: string | null;
        lastMessageAt: Date | null;
        unreadCount: number;
    }>;
    markAsRead(conversationId: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        leadId: string;
        isBotActive: boolean;
        aiAssistMode: boolean;
        lastMessage: string | null;
        lastMessageAt: Date | null;
        unreadCount: number;
    }>;
    markAsUnread(conversationId: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        leadId: string;
        isBotActive: boolean;
        aiAssistMode: boolean;
        lastMessage: string | null;
        lastMessageAt: Date | null;
        unreadCount: number;
    }>;
    useSuggestion(suggestionId: string, companyId: string, edited?: boolean): Promise<{
        id: string;
        createdAt: Date;
        usedAt: Date | null;
        leadId: string;
        conversationId: string;
        suggestedText: string;
        suggestionType: import(".prisma/client").$Enums.SuggestionType;
        used: boolean;
        editedBeforeSend: boolean;
    }>;
    dismissSuggestion(suggestionId: string, companyId: string): Promise<{
        id: string;
        createdAt: Date;
        usedAt: Date | null;
        leadId: string;
        conversationId: string;
        suggestedText: string;
        suggestionType: import(".prisma/client").$Enums.SuggestionType;
        used: boolean;
        editedBeforeSend: boolean;
    }>;
    getSuggestions(conversationId: string, companyId: string): Promise<{
        id: string;
        createdAt: Date;
        usedAt: Date | null;
        leadId: string;
        conversationId: string;
        suggestedText: string;
        suggestionType: import(".prisma/client").$Enums.SuggestionType;
        used: boolean;
        editedBeforeSend: boolean;
    }[]>;
    getStats(companyId: string, userId?: string): Promise<{
        total: number;
        unread: number;
        botActive: number;
        humanActive: number;
    }>;
}
