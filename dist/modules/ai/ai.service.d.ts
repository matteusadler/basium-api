import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
export interface CoPilotSuggestion {
    text: string;
    type: 'REPLY' | 'STRATEGY' | 'NEXT_ACTION' | 'ALERT';
}
export declare class AiService {
    private prisma;
    private usersService;
    private readonly logger;
    constructor(prisma: PrismaService, usersService: UsersService);
    private getOpenAIClient;
    generateResponse(userId: string, lead: any, conversationHistory: any[], incomingMessage: string, systemPrompt?: string): Promise<string | null>;
    private buildSystemPrompt;
    private buildLeadContext;
    suggestReply(userId: string, companyId: string, conversationId: string, leadId: string, lastMessages: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>): Promise<string[]>;
    generateCoPilotSuggestions(userId: string, lead: any, lastMessage: string): Promise<CoPilotSuggestion[]>;
    searchRelevantDocuments(userId: string, query: string, limit?: number): Promise<any[]>;
    generateEmbedding(userId: string, text: string): Promise<number[] | null>;
    processDocument(documentId: string, userId: string): Promise<void>;
    private splitIntoChunks;
    chat(userId: string, companyId: string, message: string, conversationHistory: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>): Promise<string>;
    analyzeLeadQualification(userId: string, lead: any, conversationHistory: any[]): Promise<any>;
}
