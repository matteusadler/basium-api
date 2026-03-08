import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ example: 'corretor@imobiliaria.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  password: string

  @ApiPropertyOptional({ enum: ['CORRETOR', 'GERENTE', 'ADMIN'] })
  @IsOptional()
  @IsEnum(['CORRETOR', 'GERENTE', 'ADMIN'])
  role?: string
}
