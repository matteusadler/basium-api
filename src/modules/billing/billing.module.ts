import { Module } from '@nestjs/common'
import { BillingController } from './billing.controller'
import { BillingService } from './billing.service'
import { PrismaModule } from '../../common/prisma/prisma.module'
import { PlanGuard } from './guards/plan.guard'

@Module({
  imports: [PrismaModule],
  controllers: [BillingController],
  providers: [BillingService, PlanGuard],
  exports: [BillingService, PlanGuard],
})
export class BillingModule {}
