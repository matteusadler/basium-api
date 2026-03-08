import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class LeadFiltersDto {
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
  @IsString()
  userId?: string

  @ApiPropertyOptional({ enum: ['ACTIVE', 'WON', 'LOST', 'ARCHIVED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'WON', 'LOST', 'ARCHIVED'])
  status?: string

  @ApiPropertyOptional({ enum: ['HOT', 'WARM', 'COLD'] })
  @IsOptional()
  @IsEnum(['HOT', 'WARM', 'COLD'])
  temperature?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  origin?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFavorite?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minValue?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxValue?: number

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsString()
  createdFrom?: string

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsString()
  createdTo?: string

  @ApiPropertyOptional({ enum: ['createdAt', 'updatedAt', 'lastInteraction', 'name', 'estimatedValue'] })
  @IsOptional()
  @IsString()
  sortBy?: string

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc'

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number
}
