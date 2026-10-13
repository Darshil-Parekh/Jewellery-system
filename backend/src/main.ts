import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const port = Number(config.get<string>('PORT', '3001'))
  const origin = config.getOrThrow<string>('FRONTEND_ORIGIN')

  if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be a valid TCP port number.')
  }

  app.use(helmet())
  app.use(cookieParser())
  app.enableCors({
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Initial-Admin-Setup-Token'],
  })
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  await app.listen(port, '0.0.0.0')
  console.log(`Jewellery Stock Manager API listening on port ${port}.`)
}

void bootstrap()
