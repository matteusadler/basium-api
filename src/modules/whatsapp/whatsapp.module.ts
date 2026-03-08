import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { WhatsappService } from './whatsapp.service'
import { WhatsappController } from './whatsapp.controller'
import { WhatsappProcessor } from './whatsapp.processor'
import { ConversationsModule } from '../conversations/conversations.module'
import { LeadsModule } from '../leads/leads.module'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'whatsapp',
    }),
    ConversationsModule,
    LeadsModule,
    AiModule,
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService, WhatsappProcessor],
  exports: [WhatsappService],
})
export class WhatsappModule {}
