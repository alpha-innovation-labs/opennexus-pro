import { defineConfig } from 'tsdown'
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  target: 'node26',
  exe: {
    targets: [{ platform: 'darwin', arch: 'arm64', nodeVersion: 'latest' }],
    executable: process.env.NODE_SEA_BINARY || join(process.env.HOME || '', '.local', 'cache', 'nexus', 'node-darwin-arm64'),
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
      if (existsSync(settingsSrc)) {
        const settingsDestDir = join(exeOutDir, 'default-settings')
        const settingsDest = join(settingsDestDir, 'settings.json')
        mkdirSync(settingsDestDir, { recursive: true })
        copyFileSync(settingsSrc, settingsDest)
      }

      // Copy bundled system prompt asset.
      const promptSrc = join(process.cwd(), 'prompts/base-system-prompt/system_prompt.md')
      if (existsSync(promptSrc)) {
        const promptDestDir = join(exeOutDir, 'prompts')
        const promptDest = join(promptDestDir, 'system_prompt.md')
        mkdirSync(promptDestDir, { recursive: true })
        copyFileSync(promptSrc, promptDest)
      }

      // Copy bundled theme JSON files from @earendil-works/pi-coding-agent
      // so getThemesDir() can find them at runtime. For Node.js dist/ builds,
      // the code looks for dist/modes/interactive/theme/.
      // Try multiple possible locations for the theme files.
      const possibleThemeDirs = [
        join(process.cwd(), '..', '..', 'node_modules', '@earendil-works', 'pi-coding-agent', 'dist', 'modes', 'interactive', 'theme'),
        join(process.cwd(), '..', '..', 'node_modules', '.pnpm', '@earendil-works+pi-coding-agent@*', 'node_modules', '@earendil-works', 'pi-coding-agent', 'dist', 'modes', 'interactive', 'theme'),
      ]
      let themeSrcDir = null
      for (const candidate of possibleThemeDirs) {
        if (existsSync(candidate) && readdirSync(candidate).some((f) => f.endsWith('.json'))) {
          themeSrcDir = candidate
          break
        }
      }
      if (themeSrcDir) {
        // Copy bundled theme JSON files to build output.
        // The code expects dist/modes/interactive/theme/ for Node.js builds.
        const themeDestDir = join(
          exeOutDir,
          'dist',
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
