# nexus-runtime

## The Story

Tron starts by calling `runApp(argv)` from `apps/tui/src/runtime/runApp.ts`. This is the single app entry point for both dev and release modes.

When `runApp` receives raw CLI arguments, it first extracts startup profile args, then normalizes them through two layers: `normalizeResumeStartupArgs` followed by `normalizeUsageStartupArgs`.

### Argument Normalization

`normalizeResumeStartupArgs` parses the CLI arguments to detect resume flags (`--resume`, `--resume-modal`, etc.). It distinguishes two modes:

- **Direct resume** — when a session ID follows a resume flag (e.g. `nexus --resume abc123`), it sets `NEXUS_RESUME_LAUNCH=1` and rewrites the args to strip the resume flag, passing the session ID through an environment variable.
- **Picker launch** — when a resume flag appears without a session ID (e.g. `nexus --resume-modal`), it sets both `NEXUS_RESUME_LAUNCH=1` and `NEXUS_STARTUP_RESUME_MODAL=1`, then filters out the resume flag itself so the app shows the resume picker.
- **Normal launch** — when no resume flags are present, args pass through unchanged.

`normalizeUsageStartupArgs` then normalizes usage flags (like `--help` or `--version`) for the CLI layer.

### Startup Sequence

After argument normalization, `runApp` proceeds through a phased startup sequence, each phase logged for profiling:

**Phase 1 — `copyBundledThemes`**

Tron copies bundled theme JSON files from the app bundle into the Nexus agent directory (`~/.local/share/nexus/agent/themes/`). It reads the bundled themes directory, filters for `.json` files, and copies them using `cp` with `force: false` — so existing files with matching content are skipped. If the bundled themes directory doesn't exist (e.g. in dev before release assets are staged), it silently no-ops.

**Phase 2 — `applyNexusConfigPatch`**

This is the heart of nexus-runtime. Tron imports Pi's `SettingsManager` and monkey-patches its `fromStorage` method.

When Pi later calls `SettingsManager.fromStorage()`, the patched version:

1. Calls the original `fromStorage` to get Pi's standard settings manager.
2. Deep-merges bundled app defaults (from `readBundledDefaultSettings`) into the global settings.
3. Reads the Nexus user config from `~/.config/nexus/config.json` via `readNexusUserConfig`.
4. Converts Nexus-style `extensions.pi_packages` (stored as `{ "npm:pi-chrome": true }`) into Pi-expected `globalSettings.packages` (an array like `["npm:pi-chrome"]`). Packages explicitly set to `false` are excluded entirely — Pi never sees them and never loads them.
5. Clears `globalSettings.extensions` when it's in Nexus object format, because Pi's resolver expects `extensions` to be an array of file paths.
6. Patches `getGlobalSettings()` to return the converted version, because Pi returns `structuredClone(this.globalSettings)` so in-place modifications would be lost.

The patch is guarded by a `__nexusConfigPatched__` flag, ensuring it only installs once even if called multiple times.

**Phase 3 — `getNexusAgentDirPath`**

Tron calls this to resolve the Nexus agent directory. At module-load time, `getNexusAgentDirPath.ts` runs inline logic:

- If `NEXUS_CODING_AGENT_DIR` is set, it uses that (expanded via `expandHomePath`).
- Otherwise, it defaults to `~/.local/share/nexus/agent`.
- It then sets both `NEXUS_CODING_AGENT_DIR` and `PI_CODING_AGENT_DIR` environment variables to this path (falling back to `PI_CODING_AGENT_DIR` if already set), so all downstream code agrees on the directory.

This is called during startup to ensure the env vars are anchored before any other module loads.

**Phase 4 — `ensureEmbeddedPackageDirEnv`**

Tron detects whether the current module runs from a bundled binary:

- If `PI_PACKAGE_DIR` is already set, it returns immediately.
- If the module URL contains `/build/` or `/dist/` (a tsdown-bundled binary), it points `PI_PACKAGE_DIR` at the build directory.
- If running from a Bun-compiled binary, it extracts embedded package assets to the agent directory and sets `PI_PACKAGE_DIR` to the `.package` subdirectory.

**Phases 5–13 — Platform Patches**

Tron then applies a series of platform patches from `@nexus/pi-platform`:

- `applyStartupUpdateSilencePatch` — silences update prompts during startup.
- `applyStartupChangelogSilencePatch` — silences changelog output during startup.
- `applyStartupHelpSilencePatch` — silences help output during startup.
- `applyPromptTemplateArgAppendPatch` — appends template arguments to prompts.
- `applyModelChangeDisplayPatch` — patches how model changes are displayed.
- `applyHotkeysCommandPatch` — patches hotkey handling.
- `applyNexusSystemPromptPatch` — patches the system prompt for Nexus-specific behavior.
- `applyToolExecutionSpacingPatch` — adds spacing between tool executions.
- `applyInlineImageOverlayPatch` — handles inline image overlays.
- `applyWorkingLoaderElapsedPatch` — patches the working loader elapsed time display.

Then it prunes logged-out enabled models from the current working directory.

**Phase 14 — App Args & Extensions**

Tron strips feature flags from the args, creates app args via `createAppArgs`, and resolves bundled extension factories.

**Phase 15 — Launch Pi**

Finally, Tron dynamically imports `@earendil-works/pi-coding-agent` and calls `piModule.main(args, { extensionFactories })`, handing control to Pi with Nexus's patched configuration.

### CLI Mode

When invoked as `nexus <command>`, Tron calls `runCliWithApp(argv, { runApp })` from `apps/tui/src/cli/runCliWithApp.ts`.

The CLI entry point dispatches through a series of flag checks:

1. `nexus --version` → prints version and exits.
2. `nexus --observations <session-id>` → calls `runObservationsCommand` (after calling `getNexusAgentDirPath()` to anchor env vars).
3. Mini-app commands (runner or regular) → delegates to mini-app manifests.
4. `nexus install <package>` → calls `runInstallCommand` (reads `NEXUS_CODING_AGENT_DIR` or defaults to the agent directory).
5. `nexus uninstall <package>` → calls `runUninstallCommand`.
6. `nexus pi-packages <subcommand>` → calls `runPiPackagesCommand` (skipped when `--minimal` is set).
7. `nexus --help` → prints usage.
8. `nexus sessions [--all] [--json]` → prints session table/JSON (calls `getNexusAgentDirPath()`).
9. `nexus sessions delete <session-dir> [--json]` → deletes a session.
10. `nexus themes set <theme>` → sets a theme.
11. `nexus themes list [<theme>]` → lists themes.
12. `nexus themes` → prints themes help.
13. `nexus providers` → runs the providers command.
14. `nexus subagent` → runs the subagent command.

For the main app path, it reads feature flag overrides from CLI args, handles `--minimal` mode (whitelisting only specified extensions), validates feature flag IDs, and then calls back into `runApp`.

### Config Layer

`readNexusUserConfig()` reads `~/.config/nexus/config.json` from disk, returning an empty object when the file doesn't exist. It's the single source of truth for user configuration, supporting:

- `extensions.pi_packages` — per-package enable/disable overlay (`{ "npm:pi-chrome": true }`).
- `miniApps` — per-mini-app settings.
- `packages` — package sources array.
- `localImageReader` — API endpoint, key, and model config.
- `notifyEnabled` — desktop notification toggle.
- `featureFlags` — per-feature-flag boolean overrides.
- `providers` — per-provider enable/disable overlay.

Path resolution utilities all derive from `getUserConfigDirPath()` (resolves `~/.config/nexus`, overridable via `NEXUS_CONFIG_DIR` env var):

- `getUserConfigPath()` → `~/.config/nexus/config.json`
- `getUserCommandsPath()` → `~/.config/nexus/commands`
- `getUserThemesPath()` → `~/.config/nexus/themes`
- `getUserKeybindingsPath()` → `~/.config/nexus/keybindings`
- `getUserEditorTriggersPath()` → `~/.config/nexus/editor-triggers`
- `getAgentCommandsPath()` → `<agentDir>/commands`
- `getProjectConfigPath()` → `<cwd>/.nexus/config.json`
- `getProjectConfigDirPath()` → `<cwd>/.nexus/`
- `getProjectThemesPath()` → `<cwd>/.nexus/themes`

### Session Management

When a Nexus session is active, `registerCurrentNexusSession(sessionId, sessionFile?, sessionTitle?)` registers it in the cmux session registry:

1. Gets the current cmux rename target (surface ID, workspace ID).
2. Reads the session registry JSON from disk.
3. Creates a `NexusRestoreCommand` via `createNexusResumeCommand(sessionId)`, which builds the exact CLI command needed to directly resume that session (using `createNexusRestoreLaunchSpec` and `shellQuote`).
4. Upserts the registry entry with workspace ID, surface ID, session ID, title, file path, cwd, PID, the restore command, and an ISO timestamp.
5. Writes the registry back with file locking.

### CLI Resume Parsing

`parseResumeCliRequest(argv)` scans CLI arguments for resume flags (`--resume`, `--resume-modal`, `--resume-surface`, `--resume-workspace`). For each flag:

- If the next argument looks like a session reference (a hex-like string), it returns mode `"direct"` with the target session ID.
- Otherwise, it returns mode `"picker"` to show the resume picker UI.
- `--resume=<session-id>` (equals format) is also supported for direct targeting.
- If no resume flags match, it returns mode `"none"`.

`rewriteDirectResumeArgs(args, request)` then strips the resume flag and its target from the CLI args, replacing them with environment variables (`NEXUS_RESUME_LAUNCH=1`, `NEXUS_RESUME_TARGET=<id>`) so the app layer handles the resume logic.

### Package Management

`createNexusPackageManager(cwd)` wraps Pi's `DefaultPackageManager`:

1. Creates a `SettingsManager` with Nexus's agent directory.
2. Wraps `listConfiguredPackages()` to also read from `extensions.pi_packages` in the Nexus user config.
3. For each source in `pi_packages`, it normalizes the name (e.g. `pi-chrome` → `npm:pi-chrome`) and adds it to the configured packages list if not already present.

Packages set to `false` in the config are silently excluded — they never appear in the list.

A CLI variant `createNexusCliPackageManager` does the same but without name normalization (exact source matching).

### Clipboard Image Support

On macOS, `readClipboardImageViaMacOsJxa()` executes a JXA (JavaScript for Automation) script via `osascript` that reads the clipboard through `NSPasteboard`:

1. Tries to get PNG data directly.
2. Falls back to TIFF data, converting it to PNG via `NSBitmapImageRep`.
3. Returns the base64-encoded PNG bytes, or `undefined` if no image is on the clipboard.

On non-macOS platforms, it returns `undefined` immediately.

### Child Process Utilities

`runChild(cwd, prompt)` is the single entry point for all LLM child-process calls:

1. Creates summarizer args from the prompt via `createSummarizerArgs`.
2. Gets the current Nexus launch spec via `getCurrentNexusLaunchSpec`.
3. Spawns the child process via `runBundledChildProcess`, which sets `NEXUS_DEV_MODE=1` in the child's environment.
4. Captures stdout and stderr, applies an optional timeout, and throws on non-zero exit codes or stderr output.

`runBundledChildProcess` spawns a process with `stdio: ["ignore", "pipe", "pipe"]`, collecting output into strings and resolving with `{ code, stdout, stderr }`.

### Slash Command Filtering

Runtime slash commands from Pi extensions are filtered through `filterVisibleRuntimeSlashCommands`, which hides commands with names starting with `nexus-` (prefix) or matching specific hidden names. This keeps Nexus-internal commands out of the user-facing slash menu.

### Themes

`copyBundledThemes()` copies bundled theme JSON files into the agent directory during startup (described above in the startup sequence).

`readThemes(cwd)` uses Pi's `DefaultResourceLoader` to discover themes from bundled, agent-dir, user, and project directories. Results are cached per `cwd` + `agentDir` combination to avoid reloading on every slash-menu keystroke. Returns a sorted, deduplicated list of theme names.

### Embedded Package Assets

`ensureEmbeddedPackageDirEnv()` handles three cases:
1. If `PI_PACKAGE_DIR` is already set, returns it.
2. If running from a Bun-compiled binary, extracts embedded package assets to the agent directory and sets `PI_PACKAGE_DIR` to `<agentDir>/.package`.
3. If running from a tsdown-bundled binary, sets `PI_PACKAGE_DIR` to the build directory.

`getEmbeddedPackageDirPath()` resolves to `<agentDir>/.package`.

`writeEmbeddedPackageAssets(assets)` and `getEmbeddedPackageAssets()` manage the embedded package asset manifest (a JSON file mapping package names to their bundled asset paths).

### Summary

nexus-runtime is the config-to-Pi adapter and the runtime glue for Nexus. It:

- **Normalizes CLI arguments** for resume and usage modes.
- **Patches Pi's settings system** to translate Nexus config format into Pi's expected format.
- **Resolves all paths** — config, themes, commands, keybindings, project config — relative to a configurable agent directory.
- **Manages startup** — copying themes, ensuring embedded packages, applying platform patches.
- **Handles session lifecycle** — registering sessions, building resume commands, parsing resume flags.
- **Wraps package management** — extending Pi's package manager with Nexus-style config.
- **Supports macOS clipboard images** via JXA.
- **Manages child processes** for LLM calls.
- **Filters slash commands** for the user-facing menu.

It doesn't ship a standalone binary. It's imported by `apps/tui/src/runtime/runApp.ts` (app mode), `apps/tui/src/cli/runCliWithApp.ts` (CLI mode), and various extension packages (pi-packages, cmux, feature-flags, etc.).
