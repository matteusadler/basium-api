import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsEnum } from 'class-validator'

export enum PaymentMethod {
  CARD = 'card',
  BOLETO = 'boleto',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
}

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'ID do plano' })
  @IsString()
  planId: string

  @ApiPropertyOptional({ description: 'Billing anual (true) ou mensal (false)' })
  @IsOptional()
  yearly?: boolean

  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Método de pagamento preferido' })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod

  @ApiPropertyOptional({ description: 'URL de sucesso após pagamento' })
  @IsString()
  @IsOptional()
  successUrl?: string

  @ApiPropertyOptional({ description: 'URL de cancelamento' })
  @IsString()
  @IsOptional()
  cancelUrl?: string
}

export class CreatePortalSessionDto {
  @ApiPropertyOptional({ description: 'URL de retorno após sair do portal' })
  @IsString()
  @IsOptional()
  returnUrl?: string
}

export class UpdatePaymentMethodDto {
  @ApiProperty({ description: 'ID do método de pagamento Stripe' })
  @IsString()
  paymentMethodId: string
}
