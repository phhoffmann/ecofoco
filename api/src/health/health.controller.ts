import { Controller, Get } from '@nestjs/common'
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus'
import { PrismaService } from '../prisma/prisma.service'

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  /** 200 with database "up" when Postgres answers a ping; 503 with database "down" when it doesn't. */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.prismaHealth.pingCheck('database', this.prisma)])
  }
}
