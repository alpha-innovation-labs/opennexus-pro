import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  target: 'node20',
  deps: {
    onlyImport: [
      '@clack/prompts',
      '@extensions/ai-providers',
      '@nexus/feature-flags',
      '@extensions/exit-message',
      '@extensions/observations',
      '@extensions/pi-packages',
      '@extensions/runtime',
      '@extensions/startup-hero',
      '@nexus/herdr',
      '@nexus/mini-apps',
      '@nexus/observability',
      '@nexus/pi-platform',
      '@nexus/runtime',
      'console-table-printer',
      'ink',
      'ink-big-text',
      'ink-gradient',
      'react',
    ],
  },
  exe: true
})
