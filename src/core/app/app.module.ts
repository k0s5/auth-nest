import { validate } from '@config/env.validation'
import { PrismaModule } from '@core/prisma'
import { AccountModule } from '@modules/auth/account'
import { SessionModule } from '@modules/auth/session'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { IS_DEV } from '@shared/utils/is-dev.util'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: !IS_DEV,
      envFilePath: ['.env.local', '.env', '.env.dev'],
      validate
    }),
    PrismaModule,
    AccountModule,
    SessionModule
  ]
})
export class AppModule {}
