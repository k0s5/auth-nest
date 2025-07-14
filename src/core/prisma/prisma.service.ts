import {
  Injectable,
  OnModuleDestroy,
  // INestApplication
  OnModuleInit
} from '@nestjs/common'
import { PrismaClient } from 'generated/prisma'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // constructor() {
  //   super({
  //     log: ['query'] // optional: log requests
  //   })

  //   // Connecting middleware for requests time logging
  //   this.$extends({
  //     query: {
  //       async $allOperations({ operation, model, args, query }) {
  //         const start = performance.now()
  //         const result = await query(args)
  //         const end = performance.now()
  //         const time = end - start

  //         console.log(
  //           `[Prisma Query] ${model}.${operation} took ${time.toFixed(2)}ms`
  //         )
  //         return result
  //       }
  //     }
  //   })
  // }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  // async enableShutdownHooks(app: INestApplication) {
  //   this.$on('beforeExit', async () => {
  //     await app.close()
  //   })
  // }
}
