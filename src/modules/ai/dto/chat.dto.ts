import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

class ChatMessage {
  @IsString()
  role: 'user' | 'assistant'

  @IsString()
  content: string
}

export class ChatDto {
  @ApiProperty({ description: 'User message' })
  @IsString()
  message: string

  @ApiPropertyOptional({ description: 'Conversation history' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessage)
  history?: ChatMessage[]
}
