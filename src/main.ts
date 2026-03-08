import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ 
      logger: true,
      bodyLimit: 10485760, // 10MB
    }),
  )

  // Global prefix
  app.setGlobalPrefix('api')

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  })

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Swagger desabilitado temporariamente devido a conflito de versão do Fastify
  // O Swagger será reativado em produção com a versão correta

  const port = process.env.PORT || 8001
  await app.listen(port, '0.0.0.0')
  console.log(`🚀 Basium API running on http://localhost:${port}`)
}

bootstrap()
