import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';

interface DailyInsights {
  companyId: string;
  date: Date;
  overdueContracts: number;
  expiringContracts: number;
  staleProperties: number;
  overduePayments: number;
  newLeads: number;
  closedDeals: number;
  recommendations: string[];
}

@Processor('ai-insights')
export class AIInsightsWorker extends WorkerHost {
  private readonly logger = new Logger(AIInsightsWorker.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  // Run daily at 08:00
  @Cron('0 8 * * *')
  async generateDailyInsights() {
    this.logger.log('Starting daily AI insights generation...');

    try {
      const companies = await this.prisma.company.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true },
      });

      for (const company of companies) {
        await this.generateInsightsForCompany(company.id);
      }

      this.logger.log(`Generated insights for ${companies.length} companies`);
    } catch (error) {
      this.logger.error('Error generating daily insights:', error);
    }
  }

  async process(job: Job<{ companyId: string }>): Promise<any> {
    const { companyId } = job.data;
    return this.generateInsightsForCompany(companyId);
  }

  private async generateInsightsForCompany(companyId: string): Promise<DailyInsights> {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Count contracts with overdue payments
    const overdueContracts = await this.prisma.contract.count({
      where: {
        companyId,
        status: 'ACTIVE',
        financialEntries: {
          some: {
            status: 'OVERDUE',
          },
        },
      },
    });

    // Count contracts expiring in next 30 days
    const expiringContracts = await this.prisma.contract.count({
      where: {
        companyId,
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: thirtyDaysFromNow,
        },
      },
    });

    // Count properties without activity in 90 days (stale)
    const staleProperties = await this.prisma.property.count({
      where: {
        companyId,
        status: 'AVAILABLE',
        updatedAt: {
          lt: ninetyDaysAgo,
        },
      },
    });

    // Count overdue payments
    const overduePayments = await this.prisma.financialEntry.count({
      where: {
        companyId,
        status: 'OVERDUE',
        type: 'RECEITA',
      },
    });

    // Count new leads in last 30 days
    const newLeads = await this.prisma.lead.count({
      where: {
        companyId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Count closed deals in last 30 days
    const closedDeals = await this.prisma.lead.count({
      where: {
        companyId,
        status: 'WON',
        updatedAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Generate recommendations
    const recommendations: string[] = [];

    if (overdueContracts > 0) {
      recommendations.push(
        `Atenção: ${overdueContracts} contrato(s) com pagamentos em atraso. Considere entrar em contato com os inquilinos.`
      );
    }

    if (expiringContracts > 0) {
      recommendations.push(
        `${expiringContracts} contrato(s) vencem nos próximos 30 dias. Inicie negociações de renovação.`
      );
    }

    if (staleProperties > 0) {
      recommendations.push(
        `${staleProperties} imóvel(is) sem movimentação há 90 dias. Considere revisar preço ou estratégia de marketing.`
      );
    }

    if (overduePayments > 5) {
      recommendations.push(
        `Alta inadimplência detectada (${overduePayments} pagamentos atrasados). Revise política de cobrança.`
      );
    }

    if (newLeads > 0 && closedDeals === 0) {
      recommendations.push(
        `${newLeads} novos leads mas nenhuma conversão recente. Revise o processo de vendas.`
      );
    }

    const conversionRate = newLeads > 0 ? (closedDeals / newLeads) * 100 : 0;
    if (conversionRate < 10 && newLeads > 10) {
      recommendations.push(
        `Taxa de conversão baixa (${conversionRate.toFixed(1)}%). Considere melhorar qualificação de leads.`
      );
    }

    // Save insights to database
    const insights: DailyInsights = {
      companyId,
      date: today,
      overdueContracts,
      expiringContracts,
      staleProperties,
      overduePayments,
      newLeads,
      closedDeals,
      recommendations,
    };

    await this.prisma.dailyInsight.upsert({
      where: {
        companyId_date: {
          companyId,
          date: today,
        },
      },
      update: {
        overdueContracts,
        expiringContracts,
        staleProperties,
        overduePayments,
        newLeads,
        closedDeals,
        recommendations,
      },
      create: {
        companyId,
        date: today,
        overdueContracts,
        expiringContracts,
        staleProperties,
        overduePayments,
        newLeads,
        closedDeals,
        recommendations,
      },
    });

    this.logger.log(`Generated insights for company ${companyId}`);

    return insights;
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`AI insights job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`AI insights job ${job.id} failed:`, error);
  }
}
