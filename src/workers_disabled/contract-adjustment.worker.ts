import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface AdjustmentJob {
  contractId: string;
}

@Processor('contract-adjustment')
export class ContractAdjustmentWorker extends WorkerHost {
  private readonly logger = new Logger(ContractAdjustmentWorker.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {
    super();
  }

  // Run daily at 06:00
  @Cron('0 6 * * *')
  async handleDailyAdjustments() {
    this.logger.log('Starting daily contract adjustment check...');

    try {
      // Find contracts due for adjustment (monthly anniversary)
      const today = new Date();
      const dayOfMonth = today.getDate();

      const contractsDueForAdjustment = await this.prisma.contract.findMany({
        where: {
          status: 'ACTIVE',
          type: 'LOCACAO',
          // Check if contract started on this day of month
          startDate: {
            not: null,
          },
        },
      });

      const eligibleContracts = contractsDueForAdjustment.filter((contract) => {
        const startDate = new Date(contract.startDate!);
        const startDayOfMonth = startDate.getDate();
        const monthsDiff = this.getMonthsDifference(startDate, today);
        
        // Check if it's the anniversary month (every 12 months)
        return startDayOfMonth === dayOfMonth && monthsDiff > 0 && monthsDiff % 12 === 0;
      });

      this.logger.log(`Found ${eligibleContracts.length} contracts due for adjustment`);

      for (const contract of eligibleContracts) {
        await this.processAdjustment(contract);
      }
    } catch (error) {
      this.logger.error('Error in daily adjustment check:', error);
    }
  }

  async process(job: Job<AdjustmentJob>): Promise<any> {
    const { contractId } = job.data;
    this.logger.log(`Processing adjustment for contract ${contractId}`);

    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        property: true,
        company: true,
      },
    });

    if (!contract) {
      this.logger.warn(`Contract ${contractId} not found`);
      return { status: 'error', reason: 'contract_not_found' };
    }

    return this.processAdjustment(contract);
  }

  private async processAdjustment(contract: any) {
    try {
      // Get the adjustment index rate from BCB API
      const adjustmentIndex = contract.adjustmentIndex || 'IGPM';
      const rate = await this.fetchBCBRate(adjustmentIndex);

      if (!rate) {
        this.logger.warn(`Could not fetch ${adjustmentIndex} rate`);
        return { status: 'error', reason: 'rate_not_found' };
      }

      // Calculate new rent value
      const currentRent = contract.rentValue || 0;
      const adjustmentPercentage = rate / 100;
      const newRent = Math.round(currentRent * (1 + adjustmentPercentage) * 100) / 100;

      // Update contract
      await this.prisma.contract.update({
        where: { id: contract.id },
        data: {
          rentValue: newRent,
          lastAdjustmentDate: new Date(),
          lastAdjustmentIndex: rate,
        },
      });

      // Create financial entry for the new rent
      await this.prisma.financialEntry.create({
        data: {
          companyId: contract.companyId,
          type: 'RECEITA',
          category: 'ALUGUEL',
          description: `Aluguel reajustado - ${contract.property?.title || 'Imóvel'}`,
          value: newRent,
          dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          status: 'PENDING',
          contractId: contract.id,
          propertyId: contract.propertyId,
        },
      });

      // Send notification email (simplified - would integrate with email service)
      this.logger.log(`Contract ${contract.id} adjusted: ${currentRent} -> ${newRent} (${adjustmentIndex}: ${rate}%)`);

      return {
        status: 'success',
        previousRent: currentRent,
        newRent,
        adjustmentIndex,
        rate,
      };
    } catch (error) {
      this.logger.error(`Error processing adjustment for contract ${contract.id}:`, error);
      return { status: 'error', error: error.message };
    }
  }

  private async fetchBCBRate(index: string): Promise<number | null> {
    try {
      // BCB API Series codes:
      // IPCA: 433
      // IGPM: 189
      const seriesCode = index === 'IPCA' ? '433' : '189';
      
      // Get last 12 months rate
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);

      const formattedStart = this.formatDate(startDate);
      const formattedEnd = this.formatDate(endDate);

      const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesCode}/dados?formato=json&dataInicial=${formattedStart}&dataFinal=${formattedEnd}`;

      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 10000 })
      );

      if (response.data && response.data.length > 0) {
        // Calculate accumulated rate for the period
        const rates = response.data.map((item: any) => parseFloat(item.valor));
        const accumulatedRate = rates.reduce((acc: number, rate: number) => {
          return acc * (1 + rate / 100);
        }, 1);
        
        return Math.round((accumulatedRate - 1) * 100 * 100) / 100; // Return as percentage with 2 decimals
      }

      return null;
    } catch (error) {
      this.logger.error(`Error fetching BCB rate for ${index}:`, error);
      return null;
    }
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private getMonthsDifference(startDate: Date, endDate: Date): number {
    return (
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth())
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Contract adjustment job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Contract adjustment job ${job.id} failed:`, error);
  }
}
