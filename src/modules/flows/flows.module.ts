import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { FlowsController } from './flows.controller'
import { FlowsService } from './flows.service'
import { FlowExecutorService } from './flow-executor.service'
import { PrismaModule } from '../../common/prisma/prisma.module'
import { FlowEngineProcessor } from './processors/flow-engine.processor'
import { FlowMessageProcessor } from './processors/flow-message.processor'
import { FlowWaitProcessor } from './processors/flow-wait.processor'

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue(
      { name: 'flow-engine', connection: { host: 'localhost', port: 6379 } },
      { name: 'flow-message', connection: { host: 'localhost', port: 6379 } },
      { name: 'flow-wait', connection: { host: 'localhost', port: 6379 } },
    ),
  ],
  controllers: [FlowsController],
  providers: [
    FlowsService,
    FlowExecutorService,
    FlowEngineProcessor,
    FlowMessageProcessor,
    FlowWaitProcessor,
  ],
  exports: [FlowsService, FlowExecutorService],
})
export class FlowsModule {}
