import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The bundled biome lookup grid (src/assets/biomes) is binary.
  assetsInclude: ['**/*.bin'],
  test: {
    environment: 'jsdom',
  },
})
