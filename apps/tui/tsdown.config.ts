import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/cli/runCli.ts', 'src/cli/runCliWithApp.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  target: 'node20',
  platform: 'node',
  deps: {
    neverBundle: [/^@nexus\//, /^@extensions\//],
  },
})
