import { IsString, IsOptional, IsEnum, IsArray, IsDateString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leadId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ enum: ['CALL', 'WHATSAPP', 'VISIT', 'MEETING', 'PROPOSAL', 'OTHER'] })
  @IsOptional()
  @IsEnum(['CALL', 'WHATSAPP', 'VISIT', 'MEETING', 'PROPOSAL', 'OTHER'])
  type?: string

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string

  @ApiPropertyOptional({ enum: ['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED'] })
  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED'])
  status?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dueTime?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  result?: string
}
