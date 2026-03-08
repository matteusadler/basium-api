import { IsNumber, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class MarkWonDto {
  @ApiProperty({ description: 'Final closed value' })
  @IsNumber()
  closedValue: number

  @ApiPropertyOptional({ description: 'Property ID if applicable' })
  @IsOptional()
  propertyId?: string
}
