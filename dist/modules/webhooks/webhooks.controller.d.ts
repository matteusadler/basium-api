import { WebhooksService } from './webhooks.service';
export declare class WebhooksController {
    private webhooksService;
    constructor(webhooksService: WebhooksService);
    handleFacebookLeadAds(payload: any): Promise<{
        status: string;
    }>;
    handleGoogleAds(payload: any): Promise<{
        status: string;
    }>;
}
