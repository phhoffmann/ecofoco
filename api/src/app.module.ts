import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { HealthModule } from './health/health.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  // Reads api/.env when present; real environment variables win.
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, HealthModule],
})
export class AppModule {}
