import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';

@Processor('financial-overdue')
export class FinancialOverdueWorker extends WorkerHost {
  private readonly logger = new Logger(FinancialOverdueWorker.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  // Run daily at 07:00
  @Cron('0 7 * * *')
  async markOverdueEntries() {
    this.logger.log('Starting daily overdue entries check...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all pending entries with past due dates
      const overdueEntries = await this.prisma.financialEntry.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            lt: today,
          },
        },
        select: {
          id: true,
          companyId: true,
          description: true,
          value: true,
          dueDate: true,
          type: true,
        },
      });

      this.logger.log(`Found ${overdueEntries.length} overdue entries`);

      // Update all to OVERDUE status
      const updateResult = await this.prisma.financialEntry.updateMany({
        where: {
          id: {
            in: overdueEntries.map((e) => e.id),
          },
        },
        data: {
          status: 'OVERDUE',
          updatedAt: new Date(),
        },
      });

      // Group by company for notifications
      const overdueByCompany = overdueEntries.reduce((acc, entry) => {
        if (!acc[entry.companyId]) {
          acc[entry.companyId] = [];
        }
        acc[entry.companyId].push(entry);
        return acc;
      }, {} as Record<string, typeof overdueEntries>);

      // Create notifications for each company
      for (const [companyId, entries] of Object.entries(overdueByCompany)) {
        const totalOverdue = entries.reduce((sum, e) => sum + (e.value || 0), 0);
        const receitas = entries.filter((e) => e.type === 'RECEITA');
        const despesas = entries.filter((e) => e.type === 'DESPESA');

        // Log summary
        this.logger.log(
          `Company ${companyId}: ${entries.length} overdue entries (${receitas.length} receitas, ${despesas.length} despesas), total: R$ ${totalOverdue.toFixed(2)}`
        );

        // In production, would send email/notification here
        // await this.notificationService.sendOverdueAlert(companyId, entries);
      }

      this.logger.log(`Marked ${updateResult.count} entries as overdue`);

      return {
        status: 'success',
        processed: overdueEntries.length,
        updated: updateResult.count,
      };
    } catch (error) {
      this.logger.error('Error marking overdue entries:', error);
      return { status: 'error', error: error.message };
    }
  }

  async process(job: Job<{ companyId?: string }>): Promise<any> {
    const { companyId } = job.data;
    
    if (companyId) {
      return this.markOverdueForCompany(companyId);
    }
    
    return this.markOverdueEntries();
  }

  private async markOverdueForCompany(companyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.prisma.financialEntry.updateMany({
      where: {
        companyId,
        status: 'PENDING',
        dueDate: {
          lt: today,
        },
      },
      data: {
        status: 'OVERDUE',
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Marked ${result.count} entries as overdue for company ${companyId}`);

    return {
      status: 'success',
      companyId,
      updated: result.count,
    };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Financial overdue job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Financial overdue job ${job.id} failed:`, error);
  }
}
