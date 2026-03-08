import { PrismaService } from '../../common/prisma/prisma.service';
export declare class WebhooksService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleFacebookLeadAds(payload: any): Promise<void>;
    handleGoogleAds(payload: any): Promise<void>;
}
