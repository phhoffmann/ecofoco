import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PrismaPg } from '@prisma/adapter-pg'
import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaService } from '../src/prisma/prisma.service'

// Runs against the real Postgres in DATABASE_URL (compose.yaml locally, the service container in CI).
describe('GET /health', () => {
  let app: INestApplication | undefined

  afterEach(async () => {
    await app?.close()
    app = undefined
  })

  it('reports ok and that the database answered', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = await moduleRef.createNestApplication().init()

    const res = await request(app.getHttpServer()).get('/health').expect(200)

    expect(res.body).toMatchObject({ status: 'ok', info: { database: { status: 'up' } } })
  })

  it('reports 503 with the database down when Postgres does not answer', async () => {
    // Nothing listens on port 1, so the connection is refused at once.
    const unreachable = new PrismaClient({
      adapter: new PrismaPg({ connectionString: 'postgresql://ecofoco:ecofoco@127.0.0.1:1/ecofoco' }),
    })
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(unreachable)
      .compile()
    app = await moduleRef.createNestApplication({ logger: false }).init()

    const res = await request(app.getHttpServer()).get('/health').expect(503)

    expect(res.body).toMatchObject({ status: 'error', error: { database: { status: 'down' } } })
  })
})
