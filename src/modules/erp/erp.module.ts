import { Module } from '@nestjs/common'
import { ErpService } from './erp.service'
import { ErpController } from './erp.controller'
import { PropertiesController } from './properties.controller'
import { PublicPropertiesController } from './public-properties.controller'
import { PropertiesService } from './properties.service'
import { OwnersController } from './owners.controller'
import { OwnersService } from './owners.service'
import { ContractsController } from './contracts.controller'
import { ContractsService } from './contracts.service'
import { FinancialController } from './financial.controller'
import { FinancialService } from './financial.service'
import { CommissionsController } from './commissions.controller'
import { CommissionsService } from './commissions.service'
import { PrismaModule } from '../../common/prisma/prisma.module'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [
    ErpController,
    PropertiesController,
    PublicPropertiesController,
    OwnersController,
    ContractsController,
    FinancialController,
    CommissionsController,
  ],
  providers: [
    ErpService,
    PropertiesService,
    OwnersService,
    ContractsService,
    FinancialService,
    CommissionsService,
  ],
  exports: [
    ErpService,
    PropertiesService,
    OwnersService,
    ContractsService,
    FinancialService,
    CommissionsService,
  ],
})
export class ErpModule {}
