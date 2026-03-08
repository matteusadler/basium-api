import { IsString, IsOptional, IsEnum, IsArray, IsDateString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTaskDto {
  @ApiPropertyOptional({ description: 'Lead ID to link task to' })
  @IsOptional()
  @IsString()
  leadId?: string

  @ApiProperty({ example: 'Ligar para cliente' })
  @IsString()
  title: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: ['CALL', 'WHATSAPP', 'VISIT', 'MEETING', 'PROPOSAL', 'OTHER'] })
  @IsEnum(['CALL', 'WHATSAPP', 'VISIT', 'MEETING', 'PROPOSAL', 'OTHER'])
  type: string

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string

  @ApiProperty({ description: 'Due date ISO string' })
  @IsDateString()
  dueDate: string

  @ApiPropertyOptional({ example: '14:00' })
  @IsOptional()
  @IsString()
  dueTime?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[]

  @ApiPropertyOptional({ description: 'User ID to assign task to (defaults to current user)' })
  @IsOptional()
  @IsString()
  userId?: string
}
