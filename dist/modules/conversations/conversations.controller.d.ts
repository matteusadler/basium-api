import { ConversationsService } from './conversations.service';
import { ConversationFiltersDto } from './dto/conversation-filters.dto';
import { SendMessageDto } from './dto/send-message.dto';
export declare class ConversationsController {
    private conversationsService;
    constructor(conversationsService: ConversationsService);
    findAll(user: any, filters: ConversationFiltersDto): Promise<({
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
    getStats(user: any, userId?: string): Promise<{
        total: number;
        unread: number;
        botActive: number;
        humanActive: number;
    }>;
    findByPhone(phone: string, user: any): Promise<{
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
    findByLead(leadId: string, user: any): Promise<{
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
    findOne(id: string, user: any): Promise<{
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
    getMessages(id: string, user: any, page?: string, limit?: string): Promise<{
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
    sendMessage(id: string, user: any, dto: SendMessageDto): Promise<{
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
    toggleBot(id: string, user: any, body: {
        isActive: boolean;
    }): Promise<{
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
    toggleCoPilot(id: string, user: any, body: {
        isActive: boolean;
    }): Promise<{
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
    assumeConversation(id: string, user: any): Promise<{
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
    reactivateBot(id: string, user: any): Promise<{
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
    markAsRead(id: string, user: any): Promise<{
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
    markAsUnread(id: string, user: any): Promise<{
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
    getSuggestions(id: string, user: any): Promise<{
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
    useSuggestion(suggestionId: string, user: any, body: {
        edited?: boolean;
    }): Promise<{
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
    dismissSuggestion(suggestionId: string, user: any): Promise<{
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
}
