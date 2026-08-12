import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  target: 'node20',
  platform: 'node',
  deps: {
    neverBundle: [/^@nexus\//, /^@extensions\//],
  },
})
