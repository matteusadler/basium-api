import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './strategies/jwt.strategy'
import { PrismaModule } from '../../common/prisma/prisma.module'
// Google e Facebook strategies desabilitadas temporariamente
// import { GoogleStrategy } from './strategies/google.strategy'
// import { FacebookStrategy } from './strategies/facebook.strategy'

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'basium-crm-jwt-secret-key-2024',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // GoogleStrategy,
    // FacebookStrategy,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
