import { Controller, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { WebhooksService } from './webhooks.service'

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('facebook-leads')
  @ApiOperation({ summary: 'Receive Facebook Lead Ads webhook' })
  async handleFacebookLeadAds(@Body() payload: any) {
    await this.webhooksService.handleFacebookLeadAds(payload)
    return { status: 'ok' }
  }

  @Post('google-ads')
  @ApiOperation({ summary: 'Receive Google Ads webhook' })
  async handleGoogleAds(@Body() payload: any) {
    await this.webhooksService.handleGoogleAds(payload)
    return { status: 'ok' }
  }
}
