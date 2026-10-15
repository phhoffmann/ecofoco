import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Nest's dependency injection reads decorator metadata, which Vitest's default transform (esbuild/oxc) doesn't emit.
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    include: ['test/**/*.e2e-spec.ts'],
  },
})
