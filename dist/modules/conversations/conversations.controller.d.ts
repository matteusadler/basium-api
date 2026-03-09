import { ConversationsService } from './conversations.service';
import { ConversationFiltersDto } from './dto/conversation-filters.dto';
import { SendMessageDto } from './dto/send-message.dto';
export declare class ConversationsController {
    private conversationsService;
    constructor(conversationsService: ConversationsService);
    findAll(user: any, filters: ConversationFiltersDto): Promise<any>;
    getStats(user: any, userId?: string): Promise<{
        total: any;
        unread: any;
        botActive: any;
        humanActive: any;
    }>;
    findByPhone(phone: string, user: any): Promise<any>;
    findByLead(leadId: string, user: any): Promise<any>;
    findOne(id: string, user: any): Promise<any>;
    getMessages(id: string, user: any, page?: string, limit?: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    sendMessage(id: string, user: any, dto: SendMessageDto): Promise<any>;
    toggleBot(id: string, user: any, body: {
        isActive: boolean;
    }): Promise<any>;
    toggleCoPilot(id: string, user: any, body: {
        isActive: boolean;
    }): Promise<any>;
    assumeConversation(id: string, user: any): Promise<any>;
    reactivateBot(id: string, user: any): Promise<any>;
    markAsRead(id: string, user: any): Promise<any>;
    markAsUnread(id: string, user: any): Promise<any>;
    getSuggestions(id: string, user: any): Promise<any>;
    useSuggestion(suggestionId: string, user: any, body: {
        edited?: boolean;
    }): Promise<any>;
    dismissSuggestion(suggestionId: string, user: any): Promise<any>;
}
