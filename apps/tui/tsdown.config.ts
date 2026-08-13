import { defineConfig } from 'tsdown'
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

export default defineConfig({
  entry: ['src/index.ts'],
  dts: false,
  format: ['esm'],
  clean: true,
  target: 'node26',
  // exe: {
  // targets: [{ platform: 'darwin', arch: 'arm64', nodeVersion: 'latest' }],
  // },
  hooks: {
    'build:done': async (context) => {
      const distOutDir = join(process.cwd(), 'dist')

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
        // Package-relative path for binary mode
        const settingsDestDir = join(
          distOutDir,
          'runtime',
          'config',
          'default-settings',
        )
        const settingsDest = join(settingsDestDir, 'settings.json')
        mkdirSync(settingsDestDir, { recursive: true })
        copyFileSync(settingsSrc, settingsDest)
        // Source-relative fallback for dev mode
        const settingsDestSimple = join(distOutDir, 'default-settings', 'settings.json')
        mkdirSync(join(distOutDir, 'default-settings'), { recursive: true })
        copyFileSync(settingsSrc, settingsDestSimple)
      }

      // Copy bundled system prompt asset.
      const promptSrc = join(process.cwd(), 'prompts/base-system-prompt/system_prompt.md')
      if (existsSync(promptSrc)) {
        // Package-relative path for binary mode (PI_PACKAGE_DIR/prompts/base-system-prompt/system_prompt.md)
        const promptDestDir = join(distOutDir, 'prompts', 'base-system-prompt')
        mkdirSync(promptDestDir, { recursive: true })
        const promptDest = join(promptDestDir, 'system_prompt.md')
        copyFileSync(promptSrc, promptDest)
        // Source-relative fallback for dev mode (dist/prompts/system_prompt.md)
        const promptDestSimple = join(distOutDir, 'prompts', 'system_prompt.md')
        copyFileSync(promptSrc, promptDestSimple)
      }

      // Ensure bundled commands directory exists (prompt-template placeholder).
      // getBundledCommandsPath resolves to PI_PACKAGE_DIR/commands or ./ in dev mode.
      const commandsDestDir = join(distOutDir, 'commands')
      mkdirSync(commandsDestDir, { recursive: true })

      // Copy bundled theme JSON files from @earendil-works/pi-coding-agent
      // so getThemesDir() can find them at runtime.
      // The code expects PI_PACKAGE_DIR/theme/ for Node.js builds.
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
        // pi-coding-agent's getThemesDir() expects PI_PACKAGE_DIR/dist/modes/interactive/theme/
        // when PI_PACKAGE_DIR is set (bundled binary mode).
        const themeDestDir = join(distOutDir, 'dist', 'modes', 'interactive', 'theme')
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
    alwaysBundle: [
      '@extensions/*',
      '@nexus/*',
    ],
    neverBundle: true,
  },
})
