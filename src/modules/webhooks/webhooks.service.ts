import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name)

  constructor(private prisma: PrismaService) {}

  async handleFacebookLeadAds(payload: any): Promise<void> {
    this.logger.log('Received Facebook Lead Ads webhook')
    // TODO: Process Facebook Lead Ads webhook
  }

  async handleGoogleAds(payload: any): Promise<void> {
    this.logger.log('Received Google Ads webhook')
    // TODO: Process Google Ads webhook
  }
}
