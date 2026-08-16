import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],

  format: 'esm',
  clean: true,
  target: 'node26',
  outDir: 'dist',
  sourcemap: true,
  dts: true,
  deps: {
    neverBundle: true,
  },
})
