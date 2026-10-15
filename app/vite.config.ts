import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Run the shared rules from source so edits apply without rebuilding the package; the API uses its built dist.
  resolve: {
    alias: { '@ecofoco/shared': fileURLToPath(new URL('../packages/shared/src/index.ts', import.meta.url)) },
  },
  // The bundled biome lookup grid (src/assets/biomes) is binary.
  assetsInclude: ['**/*.bin'],
  // Only the app's own page: scripts/garden-bake/bake.html loads three.js from a CDN and isn't part of the app.
  optimizeDeps: { entries: ['index.html'] },
  test: {
    environment: 'jsdom',
    // theme.test.ts reads the design tokens from index.css?raw, which Vitest otherwise empties.
    css: { include: [/index\.css/] },
  },
})
