import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
export declare class AiController {
    private aiService;
    constructor(aiService: AiService);
    chat(user: any, dto: ChatDto): Promise<{
        response: string;
    }>;
    analyzeLeadQualification(user: any, body: {
        leadId: string;
    }): Promise<{
        message: string;
    }>;
    generateSuggestions(user: any, body: {
        leadId: string;
        message: string;
    }): Promise<{
        suggestions: any[];
    }>;
    suggestReply(user: any, body: {
        conversationId: string;
        leadId: string;
        lastMessages: Array<{
            role: 'user' | 'assistant';
            content: string;
        }>;
    }): Promise<{
        suggestions: string[];
    }>;
}
