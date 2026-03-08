import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SendMessageDto {
  @ApiProperty({ description: 'Message content' })
  @IsString()
  content: string

  @ApiProperty({ enum: ['text', 'image', 'document', 'audio', 'video', 'template'] })
  @IsEnum(['text', 'image', 'document', 'audio', 'video', 'template'])
  type: string

  @ApiPropertyOptional({ description: 'Media URL (for image/document/audio/video)' })
  @IsOptional()
  @IsString()
  mediaUrl?: string

  @ApiPropertyOptional({ description: 'Filename for documents' })
  @IsOptional()
  @IsString()
  filename?: string

  @ApiPropertyOptional({ description: 'Template name for template messages' })
  @IsOptional()
  @IsString()
  templateName?: string

  @ApiPropertyOptional({ description: 'Language code for templates (default: pt_BR)' })
  @IsOptional()
  @IsString()
  languageCode?: string

  @ApiPropertyOptional({ description: 'Template components' })
  @IsOptional()
  @IsArray()
  templateComponents?: any[]
}
