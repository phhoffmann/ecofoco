import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The bundled biome lookup grid (src/assets/biomes) is binary.
  assetsInclude: ['**/*.bin'],
  // Only the app's own page: scripts/garden-bake/bake.html loads three.js from a CDN and isn't part of the app.
  optimizeDeps: { entries: ['index.html'] },
  test: {
    environment: 'jsdom',
  },
})
