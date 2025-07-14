import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

// import { SessionController } from './session.controller'
import { SessionService } from './session.service'

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('ACCESS_TOKEN_LIFETIME')
        }
      }),
      inject: [ConfigService]
    })
  ],
  // controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService]
})
export class SessionModule {}
