import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class TaskFiltersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leadId?: string

  @ApiPropertyOptional({ enum: ['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'OVERDUE'] })
  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'OVERDUE'])
  status?: string

  @ApiPropertyOptional({ enum: ['CALL', 'WHATSAPP', 'VISIT', 'MEETING', 'PROPOSAL', 'OTHER'] })
  @IsOptional()
  @IsEnum(['CALL', 'WHATSAPP', 'VISIT', 'MEETING', 'PROPOSAL', 'OTHER'])
  type?: string

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
  @IsString()
  dueDateFrom?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dueDateTo?: string

  @ApiPropertyOptional({ enum: ['dueDate', 'createdAt', 'priority'] })
  @IsOptional()
  @IsString()
  sortBy?: string

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc'
}
