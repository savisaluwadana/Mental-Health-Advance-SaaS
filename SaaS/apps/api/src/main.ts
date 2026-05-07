import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000',
    credentials: true,
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  const port = config.get<number>('PORT') ?? 4000
  try {
    await app.listen(port)
    logger.log(`SafeSpace Lanka API listening on http://localhost:${port}/api`)
  } catch (error) {
    const listenError = error as NodeJS.ErrnoException

    if (listenError.code === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use. Stop the existing API server or set PORT to another port.`)
    }

    throw error
  }
}

bootstrap()
