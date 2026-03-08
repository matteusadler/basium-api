import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsObject } from 'class-validator'

export class StartExecutionDto {
  @ApiProperty({ description: 'ID do lead' })
  @IsString()
  leadId: string

  @ApiProperty({ description: 'Telefone do contato' })
  @IsString()
  contactPhone: string

  @ApiPropertyOptional({ description: 'Variáveis iniciais' })
  @IsObject()
  @IsOptional()
  variables?: Record<string, any>

  @ApiPropertyOptional({ description: 'ID do nó inicial (opcional, usa trigger padrão)' })
  @IsString()
  @IsOptional()
  startNodeId?: string
}
