import { PortalService } from './portal.service';
export declare class PortalController {
    private portalService;
    constructor(portalService: PortalService);
    getConfig(user: any): Promise<{
        id: string;
        companyId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        facebook: string | null;
        subdomain: string;
        customDomain: string | null;
        sslProvisioned: boolean;
        favicon: string | null;
        primaryColor: string;
        secondaryColor: string;
        fontFamily: string;
        coverPhoto: string | null;
        brokerPhoto: string | null;
        bio: string | null;
        creci: string | null;
        instagram: string | null;
        linkedin: string | null;
        youtube: string | null;
        whatsappNumber: string | null;
        gaId: string | null;
        metaPixelId: string | null;
        showWatermark: boolean;
        metaTitle: string | null;
        metaDescription: string | null;
    }>;
}
