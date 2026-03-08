import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WhatsappService } from './whatsapp.service';
import { ConversationsService } from '../conversations/conversations.service';
import { LeadsService } from '../leads/leads.service';
import { AiService } from '../ai/ai.service';
export declare class WhatsappProcessor extends WorkerHost {
    private prisma;
    private whatsappService;
    private conversationsService;
    private leadsService;
    private aiService;
    private readonly logger;
    constructor(prisma: PrismaService, whatsappService: WhatsappService, conversationsService: ConversationsService, leadsService: LeadsService, aiService: AiService);
    process(job: Job<any>): Promise<any>;
    private processIncomingMessage;
    private extractMessageContent;
    private handleAIResponse;
    private generateCoPilotSuggestion;
    private isWithinWorkingHours;
    private shouldTransferToHuman;
}
