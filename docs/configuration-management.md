# Nexus Configuration Management

## Purpose

Nexus provides a hierarchical, file-based configuration system for managing user preferences, project settings, extension behavior, and feature flags. The system reads from layered sources in priority order and exposes both programmatic and interactive interfaces for modifying configuration.

## File Locations

| Scope | Path |
|-------|------|
| User config | `~/.config/nexus/config.json` (overridable via `NEXUS_CONFIG_DIR` env var) |
| Project config | `<cwd>/.nexus/config.json` |
| Bundled defaults | Shipped with the app bundle |

## Configuration Hierarchy

```
Bundled Defaults (lowest priority)
    ↓ merged by mergeSettings()
User Config (~/.config/nexus/config.json)
    ↓ merged by mergeSettings()
Project Config (<cwd>/.nexus/config.json) (highest priority)
```

- **Bundled defaults** ship with the app. They provide sensible defaults for every setting.
- **User config** lives at `~/.config/nexus/config.json` (overridable via `NEXUS_CONFIG_DIR`). It stores the user's personal overrides.
- **Project config** lives at `<cwd>/.nexus/config.json`. It stores project-specific overrides that take final precedence.

The three layers are combined by `mergeSettings()` — a deep-merge that overrides at every nesting level.

## Core Infrastructure

### `packages/nexus-runtime/src/config/`

This package is the single source of truth for reading and writing configuration on disk. Every extension and CLI command that needs configuration data goes through these functions.

#### Path Resolution

A set of path-resolving functions returns the absolute location of every Nexus-managed file and directory:

- `getUserConfigDirPath()` — resolves `~/.config/nexus` (respects `NEXUS_CONFIG_DIR` env var)
- `getUserConfigPath()` — resolves `~/.config/nexus/config.json`
- `getProjectConfigDirPath(cwd)` — resolves `<cwd>/.nexus`
- `getProjectConfigPath(cwd)` — resolves `<cwd>/.nexus/config.json`
- `getUserThemesPath()`, `getProjectThemesPath()`, `getNexusAgentDirPath()` — resolve directories for themes, commands, keybindings, editor triggers, and the agent directory.

All paths are resolved through a single helper: `expandHomePath()`, which expands `~` to the home directory.

#### Read and Write

- `readNexusUserConfig()` — reads and parses the user config file. Returns `{}` when the file does not exist. Used by ~49 callers.
- `writeNexusUserConfig(config)` — writes the config as pretty-printed JSON. Creates parent directories recursively. Used by ~23 callers.

These two functions are the only place that touch the user config file on disk. Every other write path (extension config, feature flag overrides, provider settings, theme settings) goes through `writeNexusUserConfig()`.

#### Merging

- `mergeSettings(base, overrides)` — deep-merges two settings objects. Overrides take precedence at every nesting level.

#### Config Patching

- `applyNexusConfigPatch()` — intercepts Pi's `SettingsManager.fromStorage()` to inject Nexus behavior. It merges bundled defaults with user config and converts Nexus-style package configuration (stored as `{ pi_packages: { "npm:pi-chrome": true } }`) into Pi-expected format (an array of source strings). Pi's file-based settings system is untouched; this patch only intercepts `getGlobalSettings()`.

#### Extension Management

- `removeUserExtensionConfig(packageSource)` — removes one package from the user's `extensions.pi_packages` entry in config.json.
- `setUserExtensionEnabled(packageSource, enabled)` — enables or disables a specific package.

#### Themes

- `readThemes(cwd)` — reads available theme names from bundled, agent, user, and project directories. Results are cached per cwd + agentDir combination.
- `copyBundledThemes()` — copies bundled theme files to the appropriate directory.

### `packages/nexus-runtime/src/config/types.ts`

Defines the shape of the user config file (`NexusUserConfig`). The top-level object contains:

| Field | Purpose |
|-------|---------|
| `extensions.pi_packages` | Per-package enable/disable overlay (e.g. `{ "npm:pi-chrome": true }`) |
| `miniApps` | Per-mini-app settings, keyed by mini-app ID |
| `packages` | Array of package sources (Nexus-style or string) |
| `localImageReader` | API endpoint, key, model, and max tokens for the local image reader extension |
| `notifyEnabled` | Whether desktop notifications are enabled |
| `featureFlags` | Per-feature-flag overrides: `false` to disable, omit or `true` to enable |
| `providers` | Map of AI provider configurations (host, port, api_key) |

## Feature Management

### How It Works

Feature flags control which bundled extensions and mini-apps are loaded at runtime. The registry is **hardcoded** — every extension is enabled by default. Users disable extensions by writing `featureFlags.<id>: false` into their user config file.

The system has two layers:

1. **Static registry** (`packages/feature-flags/src/registry.ts`) — defines every bundled extension, its enabled state, features, and a `register` function.
2. **Runtime overrides** (`featureFlags` in user config) — user-supplied booleans that override the registry.

### Feature Flag Modal

`packages/extension-core/src/feature-management/` provides an interactive modal for enabling and disabling features:

- `showFeaturesModal()` — opens a scrollable list of all extensions grouped by category (Core, Nexus, Pi Packages, Mini apps).
- Users press **Enter** to toggle a feature. A filter bar supports text search. Vim-style navigation (j, k, g, G) is supported.
- `persistFeatureFlagOverride(extensionId, enabled)` — writes the toggle to `~/.config/nexus/config.json` under `featureFlags.<id>`. Re-enabling removes the override.
- After each toggle, the full config is re-read and all rows are rebuilt so the UI always reflects on-disk state.

### Runtime Feature Resolution

- `createExtensionFeatureFlags()` — builds runtime feature flags from the hardcoded registry and user overrides.
- `registerEnabledExtensions()` — registers extensions whose runtime feature state is enabled.
- `applySystemExtensionAvailability()` — applies system-level checks (e.g., cmux availability) to determine which extensions are actually available.

### CLI Feature Flags

Command-line arguments `--enable-features` and `--disable-features` strip feature IDs before downstream processing. The `--no-extensions` flag disables all extensions. The `--version` flag is also parsed here.

## Extension-Specific Configuration

### The Pattern

Every extension that needs user-facing configuration follows a consistent pattern:

1. **Define a config type** — a TypeScript interface or type describing the extension's configuration fields.
2. **Provide a read function** — reads the extension's config from the user config file (via `readNexusUserConfig()`). Returns an empty/default object when not configured.
3. **Provide a write/persist function** — reads the current user config, merges the extension's config, and writes back via `writeNexusUserConfig()`.

This pattern ensures that all extension config is persisted in a single file (`~/.config/nexus/config.json`) under a unique top-level key. The core infrastructure handles reading, merging, and writing — extensions only need to define their schema and call the core functions.

### Example: AI Providers

The AI providers extension stores provider connection details (host, port, api_key) under the `providers` key in config.json:

- `readProviderConfig()` — reads configured providers, filtering to entries with host and port.
- `writeProviderConfig(providerId, config)` — merges a single provider into the `providers` map and writes back.

### Example: Local Image Reader

The local image reader extension stores API credentials under `localImageReader`:

- `loadFromUserConfig()` — reads the extension's config from config.json.
- `persistUserConfig(config)` — persists the config back to config.json.
- `resolveConfig()` — combines defaults with user config.
- `validateSettingsEntry(config)` — validates config values against a schema.

### Example: Editor Triggers and Promptline

The Neo editor extension stores trigger rules and promptline settings:

- `mergeEditorTriggerConfigs()` — merges global (user) and project trigger configs with project precedence.
- `readPromptlineConfig()`, `getPromptlineConfig()`, `refreshPromptlineConfig()` — manage promptline configuration state.

### Example: Web Search

The web search extension stores tool configuration:

- `loadWebToolsConfig()` — reads web tools configuration from disk (user or project config).

### Example: Slash Menu Settings

The slash menu provides a unified interface for modifying settings across extensions:

- `readMergedConfigs(cwd)` — reads bundled defaults, global (user), and project configs, then merges them.
- `applySlashMenuSettingValue(ctx, leaf, nextValue)` — applies a setting change from the slash menu. It handles both Pi-level settings (via `SettingsManager`) and Nexus-level settings (by reading and writing the user config file directly for settings like `notifyEnabled`).
- `readGlobalConfigs()`, `readProjectConfig(cwd)`, `readBundledDefaultSettings()` — read individual layers of the hierarchy.

## Key Files

| File | Purpose |
|------|---------|
| `packages/nexus-runtime/src/config/readNexusUserConfig.ts` | Read user config (~49 callers) |
| `packages/nexus-runtime/src/config/writeNexusUserConfig.ts` | Write user config (~23 callers) |
| `packages/nexus-runtime/src/config/types.ts` | User configuration type definition |
| `packages/nexus-runtime/src/config/mergeSettings.ts` | Deep-merge settings (4 callers) |
| `packages/nexus-runtime/src/config/applyNexusConfigPatch.ts` | Patch Pi SettingsManager (1 caller) |
| `packages/feature-flags/src/createExtensionFeatureFlags.ts` | Build runtime feature flags |
| `packages/feature-flags/src/runtimeExtensionFeatureState.ts` | Runtime feature state (5 callers) |
| `packages/extension-core/src/feature-management/model/persistFeatureFlagOverride.ts` | Persist feature flag to disk |
| `packages/extension-core/src/feature-management/command/showFeaturesModal.ts` | Feature management UI |
