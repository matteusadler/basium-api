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
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateLeadDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cpf?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientType?: string

  @ApiPropertyOptional({ enum: ['HOT', 'WARM', 'COLD'] })
  @IsOptional()
  @IsEnum(['HOT', 'WARM', 'COLD'])
  temperature?: string

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[]

  @ApiPropertyOptional()
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

  @ApiPropertyOptional()
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  features?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentType?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasPropertySwap?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  financingStatus?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monthlyIncome?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purchaseDeadline?: string

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string
}
