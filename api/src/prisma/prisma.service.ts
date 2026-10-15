import { Injectable, type OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

/**
 * The one Prisma client the server shares. It connects on the first query rather than at startup,
 * so the server still boots, and /health still answers, while Postgres is down.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService) {
    super({ adapter: new PrismaPg({ connectionString: config.getOrThrow<string>('DATABASE_URL') }) })
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
