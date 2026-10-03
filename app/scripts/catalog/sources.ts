// HTTP access for the catalog pipeline: every response is cached on disk (outside git) and each host is throttled.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const USER_AGENT = 'EcoFoco catalog builder (https://github.com/phhoffmann/ecofoco)'
const MAX_ATTEMPTS = 5

class Throttle {
  private next = 0
  private readonly minIntervalMs: number

  constructor(minIntervalMs: number) {
    this.minIntervalMs = minIntervalMs
  }

  async wait() {
    const now = Date.now()
    const at = Math.max(now, this.next)
    this.next = at + this.minIntervalMs
    if (at > now) await sleep(at - now)
  }
}

export class CachedFetcher {
  private readonly cacheDir: string
  private readonly throttle: Throttle

  constructor(cacheDir: string, minIntervalMs: number) {
    this.cacheDir = cacheDir
    this.throttle = new Throttle(minIntervalMs)
    mkdirSync(cacheDir, { recursive: true })
  }

  private pathFor(url: string, extension: string) {
    return join(this.cacheDir, `${createHash('sha1').update(url).digest('hex')}${extension}`)
  }

  private async fetchWithRetry(url: string): Promise<Response> {
    for (let attempt = 1; ; attempt++) {
      await this.throttle.wait()
      let res: Response
      try {
        res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
      } catch (err) {
        // Dropped connections are transient; retry them like a 5xx.
        if (attempt === MAX_ATTEMPTS) throw err
        await sleep(2 ** attempt * 1000)
        continue
      }
      if (res.ok) return res
      const retryable = res.status === 429 || res.status >= 500
      if (!retryable || attempt === MAX_ATTEMPTS) throw new Error(`GET ${url} → ${res.status}`)
      await sleep(2 ** attempt * 1000)
    }
  }

  async json<T>(url: string): Promise<T> {
    const path = this.pathFor(url, '.json')
    if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8')) as T
    const body = await (await this.fetchWithRetry(url)).text()
    writeFileSync(path, body)
    return JSON.parse(body) as T
  }

  async bytes(url: string): Promise<Buffer> {
    const path = this.pathFor(url, '.bin')
    if (existsSync(path)) return readFileSync(path)
    const body = Buffer.from(await (await this.fetchWithRetry(url)).arrayBuffer())
    writeFileSync(path, body)
    return body
  }
}

export function url(base: string, params: Record<string, string | number | boolean | (string | number)[]>): string {
  const u = new URL(base)
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((v) => u.searchParams.append(key, String(v)))
    else u.searchParams.set(key, String(value))
  }
  return u.toString()
}
