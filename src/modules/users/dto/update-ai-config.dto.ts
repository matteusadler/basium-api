import { IsOptional, IsString, IsBoolean, IsNumber, IsArray } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateAIConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  aiEnabled?: boolean

  @ApiPropertyOptional({ description: 'System prompt for AI assistant' })
  @IsOptional()
  @IsString()
  aiSystemPrompt?: string

  @ApiPropertyOptional({ description: 'Working hours JSON config' })
  @IsOptional()
  aiWorkingHours?: any

  @ApiPropertyOptional({ description: 'Max messages before transfer to human' })
  @IsOptional()
  @IsNumber()
  aiMaxMessages?: number

  @ApiPropertyOptional({ description: 'Keywords that trigger transfer to human' })
  @IsOptional()
  @IsArray()
  aiTransferKeywords?: string[]
}
