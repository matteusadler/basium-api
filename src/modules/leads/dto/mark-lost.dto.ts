import { IsString, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class MarkLostDto {
  @ApiProperty({
    description: 'Reason for losing the lead',
    enum: ['PRICE_HIGH', 'COMPETITOR', 'GAVE_UP', 'NO_RESPONSE', 'NOT_QUALIFIED', 'OTHER'],
  })
  @IsString()
  lostReason: string

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  note?: string
}
