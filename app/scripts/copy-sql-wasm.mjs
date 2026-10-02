// jeep-sqlite (the web SQLite store) loads /assets/sql-wasm.wasm at runtime, and the
// wasm must come from the same sql.js version as its JS glue (pinned via overrides).
import { copyFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'

const jeepRequire = createRequire(createRequire(import.meta.url).resolve('jeep-sqlite/package.json'))
mkdirSync('public/assets', { recursive: true })
copyFileSync(jeepRequire.resolve('sql.js/dist/sql-wasm.wasm'), 'public/assets/sql-wasm.wasm')
