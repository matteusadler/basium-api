import { PrismaService } from '../../common/prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { ConversationFiltersDto } from './dto/conversation-filters.dto';
import { SendMessageDto } from './dto/send-message.dto';
export declare class ConversationsService {
    private prisma;
    private whatsappService;
    constructor(prisma: PrismaService, whatsappService: WhatsappService);
    findAll(companyId: string, filters: ConversationFiltersDto): Promise<any>;
    findOne(id: string, companyId: string): Promise<any>;
    findByPhone(companyId: string, phone: string): Promise<any>;
    findByLead(companyId: string, leadId: string): Promise<any>;
    getMessages(conversationId: string, companyId: string, page?: number, limit?: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    sendMessage(conversationId: string, companyId: string, userId: string, dto: SendMessageDto): Promise<any>;
    toggleBot(conversationId: string, companyId: string, isActive: boolean): Promise<any>;
    toggleCoPilot(conversationId: string, companyId: string, isActive: boolean): Promise<any>;
    assumeConversation(conversationId: string, companyId: string): Promise<any>;
    reactivateBot(conversationId: string, companyId: string): Promise<any>;
    markAsRead(conversationId: string, companyId: string): Promise<any>;
    markAsUnread(conversationId: string, companyId: string): Promise<any>;
    useSuggestion(suggestionId: string, companyId: string, edited?: boolean): Promise<any>;
    dismissSuggestion(suggestionId: string, companyId: string): Promise<any>;
    getSuggestions(conversationId: string, companyId: string): Promise<any>;
    getStats(companyId: string, userId?: string): Promise<{
        total: any;
        unread: any;
        botActive: any;
        humanActive: any;
    }>;
}
