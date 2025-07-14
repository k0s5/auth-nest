import { validate } from '@config/env.validation'
import { AccountModule } from '@modules/auth/account'
import { SessionModule } from '@modules/auth/session'
import { PrismaModule } from '@modules/prisma'
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
