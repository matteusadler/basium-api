import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateStageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  probability?: number

  @ApiPropertyOptional({ enum: ['INITIAL', 'INTERMEDIATE', 'WON', 'LOST'] })
  @IsOptional()
  @IsEnum(['INITIAL', 'INTERMEDIATE', 'WON', 'LOST'])
  type?: string
}
