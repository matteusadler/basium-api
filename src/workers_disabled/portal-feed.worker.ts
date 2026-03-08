import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Processor('portal-feed')
export class PortalFeedWorker extends WorkerHost {
  private readonly logger = new Logger(PortalFeedWorker.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  // Run every 6 hours
  @Cron('0 */6 * * *')
  async generateAllFeeds() {
    this.logger.log('Starting portal feed generation for all companies...');

    try {
      const companies = await this.prisma.company.findMany({
        where: {
          status: 'ACTIVE',
        },
        select: { id: true, name: true },
      });

      for (const company of companies) {
        await this.generateFeedForCompany(company.id);
      }

      this.logger.log(`Feed generation completed for ${companies.length} companies`);
    } catch (error) {
      this.logger.error('Error generating feeds:', error);
    }
  }

  async process(job: Job<{ companyId: string }>): Promise<any> {
    const { companyId } = job.data;
    this.logger.log(`Generating feed for company ${companyId}`);
    return this.generateFeedForCompany(companyId);
  }

  private async generateFeedForCompany(companyId: string) {
    try {
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return { status: 'error', reason: 'company_not_found' };
      }

      const properties = await this.prisma.property.findMany({
        where: {
          companyId,
          status: 'AVAILABLE',
          showOnPortals: true,
        },
        include: {
          images: true,
          owner: true,
        },
      });

      // Generate GCI 2.0 XML for ZAP/VivaReal
      const xml = this.generateGCI2XML(company, properties);

      // Save to file (in production, would upload to S3/CDN)
      const feedDir = path.join(process.cwd(), 'feeds');
      if (!fs.existsSync(feedDir)) {
        fs.mkdirSync(feedDir, { recursive: true });
      }

      const feedPath = path.join(feedDir, `${companyId}-gci.xml`);
      fs.writeFileSync(feedPath, xml, 'utf-8');

      this.logger.log(`Generated feed for ${company.name} with ${properties.length} properties`);

      return {
        status: 'success',
        propertiesCount: properties.length,
        feedPath,
      };
    } catch (error) {
      this.logger.error(`Error generating feed for company ${companyId}:`, error);
      return { status: 'error', error: error.message };
    }
  }

  private generateGCI2XML(company: any, properties: any[]): string {
    const header = `<?xml version="1.0" encoding="UTF-8"?>
<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync" 
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                 xsi:schemaLocation="http://www.vivareal.com/schemas/1.0/VRSync">
  <Header>
    <Provider>${this.escapeXML(company.name)}</Provider>
    <Email>${this.escapeXML(company.email || '')}</Email>
    <ContactName>${this.escapeXML(company.name)}</ContactName>
    <Telephone>${this.escapeXML(company.phone || '')}</Telephone>
    <PublishDate>${new Date().toISOString()}</PublishDate>
  </Header>
  <Listings>`;

    const listings = properties.map((property) => this.generateListingXML(property, company)).join('\n');

    const footer = `
  </Listings>
</ListingDataFeed>`;

    return header + listings + footer;
  }

  private generateListingXML(property: any, company: any): string {
    const transactionType = property.transactionType === 'ALUGUEL' ? 'For Rent' : 'For Sale';
    const propertyType = this.mapPropertyType(property.type);
    const price = property.transactionType === 'ALUGUEL' ? property.rentPrice : property.price;

    const images = (property.images || [])
      .slice(0, 20)
      .map((img: any, index: number) => `
        <Item caption="Foto ${index + 1}" primary="${index === 0 ? 'true' : 'false'}">${this.escapeXML(img.url)}</Item>`)
      .join('');

    return `
    <Listing>
      <ListingID>${this.escapeXML(property.id)}</ListingID>
      <Title><![CDATA[${property.title}]]></Title>
      <TransactionType>${transactionType}</TransactionType>
      <PropertyType>${propertyType}</PropertyType>
      <DetailViewUrl>https://${company.subdomain || 'www'}.basium.com.br/imoveis/${property.id}</DetailViewUrl>
      <Media>
        <Item medium="image">${images}</Item>
      </Media>
      <Location>
        <Country>Brasil</Country>
        <State>${this.escapeXML(property.state || '')}</State>
        <City>${this.escapeXML(property.city || '')}</City>
        <Neighborhood>${this.escapeXML(property.neighborhood || '')}</Neighborhood>
        <Address>${this.escapeXML(property.address || '')}</Address>
        <PostalCode>${this.escapeXML(property.zipCode || '')}</PostalCode>
        ${property.latitude && property.longitude ? `
        <Latitude>${property.latitude}</Latitude>
        <Longitude>${property.longitude}</Longitude>` : ''}
      </Location>
      <Details>
        <PropertyAdministrationFee currency="BRL">${property.condoFee || 0}</PropertyAdministrationFee>
        <Description><![CDATA[${property.description || ''}]]></Description>
        <ListPrice currency="BRL">${price || 0}</ListPrice>
        ${property.rentPrice ? `<RentalPrice currency="BRL" period="Monthly">${property.rentPrice}</RentalPrice>` : ''}
        <LivingArea unit="square metres">${property.area || 0}</LivingArea>
        <Bedrooms>${property.bedrooms || 0}</Bedrooms>
        <Bathrooms>${property.bathrooms || 0}</Bathrooms>
        <Suites>${property.suites || 0}</Suites>
        <Garage type="Parking Spaces">${property.parking || 0}</Garage>
        ${property.features && property.features.length > 0 ? `
        <Features>
          ${property.features.map((f: string) => `<Feature>${this.escapeXML(f)}</Feature>`).join('\n          ')}
        </Features>` : ''}
      </Details>
      <ContactInfo>
        <Name>${this.escapeXML(company.name)}</Name>
        <Email>${this.escapeXML(company.email || '')}</Email>
        <Telephone>${this.escapeXML(company.phone || '')}</Telephone>
      </ContactInfo>
    </Listing>`;
  }

  private mapPropertyType(type: string): string {
    const typeMap: Record<string, string> = {
      'Apartamento': 'Residential / Apartment',
      'Casa': 'Residential / Home',
      'Cobertura': 'Residential / Penthouse',
      'Terreno': 'Residential / Land Lot',
      'Comercial': 'Commercial / Office',
      'Galpão': 'Commercial / Warehouse',
      'Sala': 'Commercial / Office',
      'Loja': 'Commercial / Retail',
    };
    return typeMap[type] || 'Residential / Apartment';
  }

  private escapeXML(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Portal feed job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Portal feed job ${job.id} failed:`, error);
  }
}
