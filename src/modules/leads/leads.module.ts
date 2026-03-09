import { Module } from '@nestjs/common'
import { LeadsService } from './leads.service'
import { LeadsController } from './leads.controller'
import { LeadTagsController } from './lead-tags.controller'
import { PrismaModule } from '../../common/prisma/prisma.module'
import { FlowsModule } from '../flows/flows.module'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [PrismaModule, FlowsModule, NotificationsModule],
  controllers: [LeadsController, LeadTagsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
