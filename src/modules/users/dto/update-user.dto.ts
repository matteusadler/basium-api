import { IsOptional, IsString, MinLength, IsBoolean, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string

  @ApiPropertyOptional({ enum: ['CORRETOR', 'GERENTE', 'ADMIN'] })
  @IsOptional()
  @IsEnum(['CORRETOR', 'GERENTE', 'ADMIN'])
  role?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
