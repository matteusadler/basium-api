import { WhatsappService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class WhatsappController {
    private whatsappService;
    constructor(whatsappService: WhatsappService);
    verifyWebhook(mode: string, token: string, challenge: string): string;
    handleWebhook(body: any, signature: string): Promise<{
        status: string;
    }>;
    getStatus(user: any): Promise<{
        connected: boolean;
        phoneNumber: any;
        connectedAt: any;
        wabaId: any;
    }>;
    handleEmbeddedSignupCallback(user: any, body: {
        code: string;
    }): Promise<any>;
    disconnect(user: any): Promise<{
        success: boolean;
    }>;
    sendMessage(user: any, dto: SendMessageDto): Promise<any>;
    getTemplates(user: any): Promise<{
        templates: any[];
        error: string;
    } | {
        templates: any[];
        error?: undefined;
    }>;
}
