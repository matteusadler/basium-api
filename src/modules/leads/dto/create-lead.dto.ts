import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  IsDateString,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateLeadDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string

  @ApiProperty({ example: '5511999999999' })
  @IsString()
  phone: string

  @ApiPropertyOptional({ example: 'joao@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cpf?: string

  @ApiPropertyOptional({ enum: ['PF', 'PJ'] })
  @IsOptional()
  @IsString()
  clientType?: string

  @ApiProperty({ example: 'WHATSAPP', enum: ['WHATSAPP', 'FACEBOOK', 'GOOGLE', 'PORTAL', 'MANUAL', 'SITE', 'INDICATION'] })
  @IsString()
  origin: string

  @ApiPropertyOptional({ enum: ['HOT', 'WARM', 'COLD'] })
  @IsOptional()
  @IsEnum(['HOT', 'WARM', 'COLD'])
  temperature?: string

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string

  @ApiPropertyOptional({ example: ['investidor', 'urgente'] })
  @IsOptional()
  @IsArray()
  tags?: string[]

  // Preferências de imóvel
  @ApiPropertyOptional({ example: ['APARTMENT', 'HOUSE'] })
  @IsOptional()
  @IsArray()
  propertyTypes?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minValue?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxValue?: number

  @ApiPropertyOptional({ example: ['Centro', 'Jardins'] })
  @IsOptional()
  @IsArray()
  neighborhoods?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bedrooms?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  suites?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  parkingSpots?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minArea?: number

  @ApiPropertyOptional({ example: ['piscina', 'churrasqueira'] })
  @IsOptional()
  @IsArray()
  features?: string[]

  // Financeiro
  @ApiPropertyOptional({ enum: ['CASH', 'FINANCING', 'FGTS', 'CONSORTIUM', 'SWAP'] })
  @IsOptional()
  @IsString()
  paymentType?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasPropertySwap?: boolean

  @ApiPropertyOptional({ enum: ['NOT_STARTED', 'ANALYZING', 'PRE_APPROVED', 'APPROVED'] })
  @IsOptional()
  @IsString()
  financingStatus?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monthlyIncome?: number

  // Comercial
  @ApiPropertyOptional({ enum: ['IMMEDIATE', '3_MONTHS', '6_MONTHS', '1_YEAR', 'MORE'] })
  @IsOptional()
  @IsString()
  purchaseDeadline?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pipelineId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stageId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedValue?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nextAction?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  nextActionDate?: string

  @ApiPropertyOptional({ description: 'User ID to assign lead to (defaults to current user)' })
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional({ description: 'Ignore duplicate warning and create anyway' })
  @IsOptional()
  @IsBoolean()
  ignoreDuplicate?: boolean
}
