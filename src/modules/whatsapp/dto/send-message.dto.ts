import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SendMessageDto {
  @ApiProperty({ description: 'Recipient phone number (E.164 format)' })
  @IsString()
  to: string

  @ApiProperty({ enum: ['text', 'image', 'document', 'template', 'interactive'] })
  @IsEnum(['text', 'image', 'document', 'template', 'interactive'])
  type: string

  @ApiPropertyOptional({ description: 'Text content (for text messages)' })
  @IsOptional()
  @IsString()
  text?: string

  @ApiPropertyOptional({ description: 'Media URL (for image/document messages)' })
  @IsOptional()
  @IsString()
  mediaUrl?: string

  @ApiPropertyOptional({ description: 'Caption for media' })
  @IsOptional()
  @IsString()
  caption?: string

  @ApiPropertyOptional({ description: 'Filename (for document messages)' })
  @IsOptional()
  @IsString()
  filename?: string

  @ApiPropertyOptional({ description: 'Template name (for template messages)' })
  @IsOptional()
  @IsString()
  templateName?: string

  @ApiPropertyOptional({ description: 'Language code (default: pt_BR)' })
  @IsOptional()
  @IsString()
  languageCode?: string

  @ApiPropertyOptional({ description: 'Template components' })
  @IsOptional()
  @IsArray()
  templateComponents?: any[]
}
