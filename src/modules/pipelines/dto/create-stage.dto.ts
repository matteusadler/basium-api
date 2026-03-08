import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateStageDto {
  @ApiProperty({ example: 'Nova Etapa' })
  @IsString()
  name: string

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsOptional()
  @IsString()
  color?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  probability?: number

  @ApiPropertyOptional({ enum: ['INITIAL', 'INTERMEDIATE', 'WON', 'LOST'] })
  @IsOptional()
  @IsEnum(['INITIAL', 'INTERMEDIATE', 'WON', 'LOST'])
  type?: string
}
