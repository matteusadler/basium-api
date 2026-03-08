import { Module, forwardRef } from '@nestjs/common'
import { ConversationsService } from './conversations.service'
import { ConversationsController } from './conversations.controller'
import { WhatsappModule } from '../whatsapp/whatsapp.module'

@Module({
  imports: [forwardRef(() => WhatsappModule)],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
