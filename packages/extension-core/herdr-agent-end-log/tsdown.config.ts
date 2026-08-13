import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  dts: false,
  format: 'esm',
  clean: true,
  target: 'node26',
  deps: {
    neverBundle: true,
  },
})
