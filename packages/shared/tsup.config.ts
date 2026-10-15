import { defineConfig } from 'tsup'

// Dual ESM/CJS, so the Vite app (ESM) and the NestJS API (CommonJS) both load it without loader tricks.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  // tsup 8's declaration build sets baseUrl, which TypeScript 6 deprecates.
  dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
  clean: true,
  target: 'es2023',
})
