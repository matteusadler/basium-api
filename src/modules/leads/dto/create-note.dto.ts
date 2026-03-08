import { IsString, IsBoolean, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateNoteDto {
  @ApiProperty({ description: 'Note content' })
  @IsString()
  content: string

  @ApiPropertyOptional({ description: 'Pin note to top' })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean
}
