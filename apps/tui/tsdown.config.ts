import { defineConfig } from 'tsdown'
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  target: 'node26',
  exe: {
    targets: [{ platform: 'darwin', arch: 'arm64', nodeVersion: 'latest' }],
  },
  hooks: {
    'build:done': async (context) => {
      const exeOutDir = join(process.cwd(), 'build')

      // Copy bundled default settings asset so getBundledDefaultSettingsPath
      // can find it at runtime in the compiled binary.
      const settingsSrc = join(
        process.cwd(),
        '..',
        '..',
        'packages',
        'nexus-runtime',
        'src',
        'config',
        'default-settings',
        'settings.json',
      )
      const settingsDestDir = join(exeOutDir, 'default-settings')
      const settingsDest = join(settingsDestDir, 'settings.json')
      mkdirSync(settingsDestDir, { recursive: true })
      copyFileSync(settingsSrc, settingsDest)

      // Copy bundled system prompt asset.
      const promptSrc = join(process.cwd(), 'prompts/base-system-prompt/system_prompt.md')
      const promptDestDir = join(exeOutDir, 'prompts')
      const promptDest = join(promptDestDir, 'system_prompt.md')
      mkdirSync(promptDestDir, { recursive: true })
      copyFileSync(promptSrc, promptDest)

      // Copy bundled theme JSON files from @earendil-works/pi-coding-agent
      // so getThemesDir() can find them at runtime. The binary sets
      // PI_PACKAGE_DIR=build/ and getThemesDir() resolves to
      // <PI_PACKAGE_DIR>/src/modes/interactive/theme/.
      const themeSrcDir = join(
        process.cwd(),
        '..',
        '..',
        'node_modules',
        '@earendil-works',
        'pi-coding-agent',
        'dist',
        'modes',
        'interactive',
        'theme',
      )
      if (!readdirSync(themeSrcDir).some((f) => f.endsWith('.json'))) {
        // Theme directory not found (e.g. pnpm workspace layout).
        // Skip copying themes — the binary will fall back to source-relative paths.
      } else {
        // Copy bundled theme JSON files to build output.
        const themeDestDir = join(
          exeOutDir,
          'src',
          'modes',
          'interactive',
          'theme',
        )
        mkdirSync(themeDestDir, { recursive: true })
        for (const file of readdirSync(themeSrcDir)) {
          if (file.endsWith('.json')) {
            copyFileSync(join(themeSrcDir, file), join(themeDestDir, file))
          }
        }
      }
    },
  },
  deps: {
    onlyImport: [
      'console-table-printer',
      'ink',
      'ink-big-text',
      'ink-gradient',
      'react',
    ],
    alwaysBundle: [
      '@clack/prompts',
      '@nexus/console-table-printer',
      '@nexus/mini-apps',
      '@nexus/feature-flags',
      '@nexus/herdr',
      '@nexus/observability',
      '@nexus/pi-platform',
      '@nexus/runtime',
      '@nexus/tui-kit',
      '@extensions/ai-providers',
      '@extensions/exit-message',
      '@extensions/observations',
      '@extensions/pi-packages',
      '@extensions/runtime',
      '@extensions/startup-hero',
    ],
    onlyBundle: [
      '@clack/prompts',
      'simple-wcswidth',
      'chalk',
      'isexe',
      'which',
      'path-key',
      'cross-spawn',
      'shebang-regex',
      'shebang-command',
      '@earendil-works/pi-coding-agent',
      'typebox',
      '@sinclair/typebox',
      '@earendil-works/pi-ai',
      'partial-json',
      '@anthropic-ai/sdk',
      'openai',
      'retry',
      'p-retry',
      'extend',
      'gaxios',
      'ms',
      'debug',
      'has-flag',
      'supports-color',
      'agent-base',
      'https-proxy-agent',
      'data-uri-to-buffer',
      'web-streams-polyfill',
      'fetch-blob',
      'formdata-polyfill',
      'node-fetch',
      'node-domexception',
      'bignumber.js',
      'json-bigint',
      'gcp-metadata',
      'google-logging-utils',
      'base64-js',
      'google-auth-library',
      'safe-buffer',
      'ecdsa-sig-formatter',
      'jws',
      'buffer-equal-constant-time',
      'jwa',
      'ws',
      'node-gyp-build',
      'bufferutil',
      'utf-8-validate',
      '@google/genai',
      '@mistralai/mistralai',
      '@opentelemetry/api',
      '@opentelemetry/semantic-conventions',
      'zod',
      'zod-to-json-schema',
      'marked',
      '@earendil-works/pi-tui',
      'get-east-asian-width',
      'highlight.js',
      'yaml',
      '@silvia-odwyer/photon-node',
      '@earendil-works/pi-telemetry',
      '@earendil-works/pi-agent-core',
      'ignore',
      'diff',
      'jiti',
      'graceful-fs',
      'signal-exit',
      'proper-lockfile',
      'balanced-match',
      'brace-expansion',
      'minimatch',
      'glob',
      'semver',
      'lru-cache',
      'hosted-git-info',
      'undici',
      'grok-mermaid',
      'cli-table3',
      'ansi-regex',
      'strip-ansi',
      'is-fullwidth-code-point',
      'emoji-regex',
      'string-width',
      '@colors/colors',
      'fast-string-truncated-width',
      'fast-string-width',
      'fast-wrap-ansi',
      'sisteransi',
      '@clack/core',
    ],
  },
})
