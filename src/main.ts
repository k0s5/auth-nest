import { AppModule } from '@core/app'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  app.use(cookieParser(configService.getOrThrow<string>('COOKIE_SECRET')))
  await app.listen(configService.getOrThrow<number>('PORT'))
}
bootstrap()
