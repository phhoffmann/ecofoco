/**
 * Bakes the garden's archetype sprites from CC0 3D kits (build time only).
 *
 * Outputs (all committed):
 *   src/assets/garden/<name>.webp      one transparent sprite per entry in scripts/garden-bake/sprites.ts
 *   src/assets/garden/sprites.json     each sprite's size and foot point, in pixels
 *
 * Run from app/ (Node ≥ 22.18, for TypeScript type stripping):  npm run bake:garden
 * Needs Google Chrome or Chromium (set CHROME_BIN to override `google-chrome`) and `unzip`. The kits are
 * downloaded once into app/.garden-cache/ (git-ignored; override with GARDEN_CACHE_DIR).
 *
 * Each sprite is rendered by scripts/garden-bake/bake.html with a fixed orthographic camera (30° elevation,
 * 45° azimuth), so one world unit of ground is the same 2:1 diamond as one garden tile and every sprite shares
 * one scale: a sprite's width in tiles is simply its pixel width over TILE_PX.
 */
import { execFile, execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import sharp from 'sharp'
import { KITS, SPRITES } from './garden-bake/sprites.ts'

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const BAKE_DIR = join(appRoot, 'scripts/garden-bake')
const OUT_DIR = join(appRoot, 'src/assets/garden')
const CACHE_DIR = process.env.GARDEN_CACHE_DIR ?? join(appRoot, '.garden-cache')
const CHROME = process.env.CHROME_BIN ?? 'google-chrome'

/** Width of one ground tile's diamond in the final sprites. */
export const TILE_PX = 256
// Rendered at SUPERSAMPLE× and downscaled, for clean edges.
const SUPERSAMPLE = 2
const FRAME = { width: 1024, height: 1600, originX: 512, originY: 1400 }
const WEBP_QUALITY = 88

async function ensureKits() {
  mkdirSync(CACHE_DIR, { recursive: true })
  for (const kit of KITS) {
    const dir = join(CACHE_DIR, kit.id)
    if (existsSync(dir)) continue
    console.log(`Downloading ${kit.id}…`)
    const res = await fetch(kit.url)
    if (!res.ok) throw new Error(`${kit.url}: HTTP ${res.status}`)
    const zip = join(CACHE_DIR, `${kit.id}.zip`)
    writeFileSync(zip, Buffer.from(await res.arrayBuffer()))
    execFileSync('unzip', ['-q', '-o', zip, '-d', dir])
  }
}

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png',
}

/** Serves bake.html and the kit cache over HTTP; Chrome won't load modules or models from file://. */
function serve(): Promise<{ url: string; close: () => void }> {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname)
    const [root, rest] = path.startsWith('/kits/') ? [CACHE_DIR, path.slice(6)] : [BAKE_DIR, path.slice(1)]
    const file = normalize(join(root, rest))
    if (!file.startsWith(root) || !existsSync(file)) {
      res.writeHead(404).end()
      return
    }
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
    res.end(readFileSync(file))
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      resolve({ url: `http://127.0.0.1:${port}`, close: () => server.close() })
    })
  })
}

// Async on purpose: a sync spawn would block the event loop, and with it the server Chrome loads from.
async function screenshot(url: string, out: string, profile: string) {
  await promisify(execFile)(
    CHROME,
    [
      '--headless=new',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--user-data-dir=${profile}`,
      `--window-size=${FRAME.width},${FRAME.height}`,
      '--default-background-color=00000000',
      '--virtual-time-budget=15000',
      `--screenshot=${out}`,
      url,
    ],
    { timeout: 60_000 },
  )
}

interface SpriteMeta {
  width: number
  height: number
  /** The model's ground origin (where it stands), from the sprite's top-left. */
  footX: number
  footY: number
}

async function main() {
  await ensureKits()
  const server = await serve()
  const profile = mkdtempSync(join(tmpdir(), 'garden-bake-'))
  const raw = join(profile, 'raw.png')
  const pixelsPerUnit = ((TILE_PX * SUPERSAMPLE) / Math.SQRT2)
  const manifest: Record<string, SpriteMeta> = {}

  try {
    for (const { name, job } of SPRITES) {
      const fullJob = { ...job, model: job.model && `/kits/${job.model}`, frame: { ...FRAME, pixelsPerUnit } }
      await screenshot(`${server.url}/bake.html?job=${encodeURIComponent(JSON.stringify(fullJob))}`, raw, profile)

      const { data, info } = await sharp(raw).trim({ threshold: 0 }).toBuffer({ resolveWithObject: true })
      if (info.trimOffsetLeft === undefined || info.trimOffsetTop === undefined) throw new Error(`${name}: empty render`)
      const width = Math.round(info.width / SUPERSAMPLE)
      const height = Math.round(info.height / SUPERSAMPLE)
      await sharp(data)
        .resize(width, height, { kernel: 'lanczos3' })
        .webp({ quality: WEBP_QUALITY, alphaQuality: 100, effort: 6 })
        .toFile(join(OUT_DIR, `${name}.webp`))

      manifest[name] = {
        width,
        height,
        footX: Math.round((FRAME.originX + info.trimOffsetLeft) / SUPERSAMPLE),
        footY: Math.round((FRAME.originY + info.trimOffsetTop) / SUPERSAMPLE),
      }
      console.log(`${name}: ${width}×${height}`)
    }
  } finally {
    server.close()
    rmSync(profile, { recursive: true, force: true })
  }

  writeFileSync(join(OUT_DIR, 'sprites.json'), `${JSON.stringify({ tilePx: TILE_PX, sprites: manifest }, null, 2)}\n`)
}

await main()
