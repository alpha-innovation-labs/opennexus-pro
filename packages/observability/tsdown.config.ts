import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  clean: true,
  target: 'node26',
  deps: {
    neverBundle: true,
  },
})
