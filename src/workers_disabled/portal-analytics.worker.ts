import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import Redis from 'ioredis';

interface AnalyticsEvent {
  companyId: string;
  portalConfigId?: string;
  propertyId?: string;
  eventType: 'pageview' | 'search' | 'contact' | 'whatsapp' | 'call' | 'share';
  page: string;
  source?: string;
  timestamp: number;
  sessionId?: string;
  userAgent?: string;
  referrer?: string;
}

@Injectable()
export class PortalAnalyticsWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PortalAnalyticsWorker.name);
  private redis: Redis | null = null;
  private isProcessing = false;
  private readonly QUEUE_KEY = 'portal:analytics:queue';
  private readonly BATCH_SIZE = 100;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redis = new Redis(redisUrl);
      
      this.redis.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });

      this.redis.on('connect', () => {
        this.logger.log('Connected to Redis for analytics');
      });

      // Start processing interval (every 60 seconds)
      this.intervalId = setInterval(() => this.processBatch(), 60000);
      
      this.logger.log('Portal analytics worker initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
    }
  }

  async onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.redis) {
      await this.redis.quit();
    }
  }

  // Also run on a cron schedule as backup
  @Cron('*/60 * * * * *') // Every 60 seconds
  async scheduledProcess() {
    await this.processBatch();
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.redis) {
      this.logger.warn('Redis not available, skipping analytics event');
      return;
    }

    try {
      await this.redis.lpush(this.QUEUE_KEY, JSON.stringify(event));
    } catch (error) {
      this.logger.error('Error tracking analytics event:', error);
    }
  }

  async processBatch(): Promise<void> {
    if (this.isProcessing || !this.redis) {
      return;
    }

    this.isProcessing = true;

    try {
      // Get batch of events from Redis
      const events: string[] = [];
      for (let i = 0; i < this.BATCH_SIZE; i++) {
        const event = await this.redis.rpop(this.QUEUE_KEY);
        if (!event) break;
        events.push(event);
      }

      if (events.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.log(`Processing ${events.length} analytics events`);

      // Parse and aggregate events
      const parsedEvents = events.map((e) => JSON.parse(e) as AnalyticsEvent);

      // Group pageviews for aggregation
      const pageviewsByKey = new Map<string, { count: number; event: AnalyticsEvent }>();

      for (const event of parsedEvents) {
        if (event.eventType === 'pageview') {
          const key = `${event.companyId}:${event.page}:${event.propertyId || 'none'}:${event.source || 'direct'}`;
          const existing = pageviewsByKey.get(key);
          if (existing) {
            existing.count++;
          } else {
            pageviewsByKey.set(key, { count: 1, event });
          }
        } else {
          // Other events are stored individually
          await this.storeEvent(event);
        }
      }

      // Upsert aggregated pageviews
      for (const [key, data] of pageviewsByKey) {
        await this.upsertPageview(data.event, data.count);
      }

      this.logger.log(`Processed ${events.length} analytics events successfully`);
    } catch (error) {
      this.logger.error('Error processing analytics batch:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async storeEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await this.prisma.portalAnalytics.create({
        data: {
          companyId: event.companyId,
          portalConfigId: event.portalConfigId,
          propertyId: event.propertyId,
          eventType: event.eventType,
          page: event.page,
          source: event.source,
          date: new Date(event.timestamp),
          count: 1,
        },
      });
    } catch (error) {
      this.logger.error('Error storing event:', error);
    }
  }

  private async upsertPageview(event: AnalyticsEvent, count: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Try to find existing record for today
      const existing = await this.prisma.portalAnalytics.findFirst({
        where: {
          companyId: event.companyId,
          eventType: 'pageview',
          page: event.page,
          propertyId: event.propertyId || null,
          source: event.source || 'direct',
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      if (existing) {
        await this.prisma.portalAnalytics.update({
          where: { id: existing.id },
          data: { count: existing.count + count },
        });
      } else {
        await this.prisma.portalAnalytics.create({
          data: {
            companyId: event.companyId,
            portalConfigId: event.portalConfigId,
            propertyId: event.propertyId,
            eventType: 'pageview',
            page: event.page,
            source: event.source || 'direct',
            date: today,
            count,
          },
        });
      }
    } catch (error) {
      this.logger.error('Error upserting pageview:', error);
    }
  }

  // Get analytics summary for a company
  async getAnalyticsSummary(companyId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const analytics = await this.prisma.portalAnalytics.groupBy({
      by: ['eventType'],
      where: {
        companyId,
        date: { gte: startDate },
      },
      _sum: { count: true },
    });

    const topProperties = await this.prisma.portalAnalytics.groupBy({
      by: ['propertyId'],
      where: {
        companyId,
        propertyId: { not: null },
        eventType: 'pageview',
        date: { gte: startDate },
      },
      _sum: { count: true },
      orderBy: { _sum: { count: 'desc' } },
      take: 10,
    });

    const topSources = await this.prisma.portalAnalytics.groupBy({
      by: ['source'],
      where: {
        companyId,
        eventType: 'pageview',
        date: { gte: startDate },
      },
      _sum: { count: true },
      orderBy: { _sum: { count: 'desc' } },
    });

    return {
      byEventType: analytics.reduce((acc, item) => {
        acc[item.eventType] = item._sum.count || 0;
        return acc;
      }, {} as Record<string, number>),
      topProperties,
      topSources,
    };
  }
}
