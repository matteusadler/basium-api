import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './common/prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { CompaniesModule } from './modules/companies/companies.module'
import { LeadsModule } from './modules/leads/leads.module'
import { PipelinesModule } from './modules/pipelines/pipelines.module'
import { TasksModule } from './modules/tasks/tasks.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import { ErpModule } from './modules/erp/erp.module'
// import { ConversationsModule } from './modules/conversations/conversations.module'
// import { WhatsappModule } from './modules/whatsapp/whatsapp.module'
import { AiModule } from './modules/ai/ai.module'
// import { FlowsModule } from './modules/flows/flows.module'
// import { NotificationsModule } from './modules/notifications/notifications.module'
// import { DocumentsModule } from './modules/documents/documents.module'
// import { BillingModule } from './modules/billing/billing.module'
// import { PortalModule } from './modules/portal/portal.module'
// import { ReportsModule } from './modules/reports/reports.module'
// import { WebhooksModule } from './modules/webhooks/webhooks.module'

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),

    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // BullMQ (Redis queue) - DESABILITADO temporariamente (sem Redis)
    // BullModule.forRoot({
    //   connection: {
    //     host: process.env.REDIS_HOST || 'localhost',
    //     port: parseInt(process.env.REDIS_PORT || '6379'),
    //     password: process.env.REDIS_PASSWORD || undefined,
    //   },
    // }),

    // Database
    PrismaModule,

    // Core modules
    AuthModule,
    UsersModule,
    CompaniesModule,

    // CRM
    LeadsModule,
    PipelinesModule,
    TasksModule,

    // Dashboard
    DashboardModule,

    // ERP
    ErpModule,

    // Módulos desabilitados temporariamente (requerem Redis ou outras dependências)
    // WhatsappModule,
    // ConversationsModule,
    AiModule,
    // FlowsModule,
    // NotificationsModule,
    // DocumentsModule,
    // BillingModule,
    // PortalModule,
    // ReportsModule,
    // WebhooksModule,
  ],
})
export class AppModule {}
