import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

class StageInput {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  color?: string

  @IsOptional()
  order?: number

  @IsOptional()
  probability?: number

  @IsOptional()
  @IsString()
  type?: string
}

export class CreatePipelineDto {
  @ApiProperty({ example: 'Vendas' })
  @IsString()
  name: string

  @ApiProperty({ enum: ['SALE', 'RENT', 'SWAP'], example: 'SALE' })
  @IsEnum(['SALE', 'RENT', 'SWAP'])
  type: string

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean

  @ApiPropertyOptional({ description: 'Custom stages (optional - uses defaults if not provided)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StageInput)
  stages?: StageInput[]
}
