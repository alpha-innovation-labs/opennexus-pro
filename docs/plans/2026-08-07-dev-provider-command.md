# Plan: `just dev provider <command>` — Provider Management CLI

## Problem

Providers are hardcoded in `AiGateway` constructors with no user configuration storage.
There is no way to list, enable, disable, configure, or refresh providers from the CLI.

**Critical blocker:** Each gateway subclass (`LiteLLmGateway`, `LmStudioGateway`, `OllamaGateway`,
`LlamaCppGateway`, `VllmGateway`) exposes only `{ apiKey?: string }` in its constructor options.
The `baseUrl` is hardcoded per-class (e.g. `"http://localhost:11434"`) and cannot be overridden.
User-configured URLs are therefore impossible without first upgrading every gateway constructor.

## Goal

Implement a `just dev provider <command>` CLI entry point that manages local LLM providers
with persistent configuration stored in `~/.config/nexus/config.json` under a `providers` key:

```json
{
  "providers": {
    "litellm": { "host": "localhost", "port": 4000, "api_key": "sk-xxx" },
    "ollama": { "host": "localhost", "port": 11434 },
    "lm-studio": { "host": "localhost", "port": 1234 }
  }
}
```

Supported commands: `list`, `enable`, `disable`, `refresh`, `get`, `setup`.

## Scope

- **Phase 0 (Gateway upgrade):** Modify all 5 gateway subclasses to accept `baseUrl` and
  `apiKey` overrides in their constructors. Fix Ollama's port typo (`11234` → `11434`).
  This is a prerequisite — nothing below works without it.
- **Phase 1 (MVP):** `litellm`, `lm-studio`, `ollama`, `llama.cpp`, `vllm` gateways.
- **Phase 2:** Extend `getGateways()` to support all 24 providers from `DEFAULT_PORTS`
  (creating gateway instances on-demand for unimplemented providers).
- **Phase 3:** CLI wiring (`just dev provider …`) → slash command integration.

## Architecture

```
packages/extension-core/src/ai-providers/
├── config/                       ← NEW: provider config management
│   ├── index.ts
│   ├── readProviderConfig.ts     ← reads providers from config.json
│   ├── writeProviderConfig.ts    ← writes providers to config.json
│   └── types.ts                  ← ProviderConfig schema
├── gateways/
│   ├── getGateways.ts            ← NEW: config-driven gateway factory
│   ├── litellm.ts                ← MODIFIED: accepts `baseUrl` override
│   ├── lm-studio.ts              ← MODIFIED: accepts `baseUrl` override
│   ├── ollama.ts                 ← MODIFIED: accepts `baseUrl` override, fixes port
│   ├── llama-cpp.ts              ← MODIFIED: accepts `baseUrl` override
│   └── vllm.ts                   ← MODIFIED: accepts `baseUrl` override
apps/tui/src/cli/
└── providers/                    ← NEW: CLI entry point (moves from ai-providers/cli/)
    ├── index.ts                  ← exports all commands
    ├── hasProvidersFlag.ts       ← flag checker
    ├── parseProvidersCommand.ts  ← argument parser
    ├── ProvidersCommandOptions.ts ← options type
    ├── printProvidersHelp.ts     ← usage text
    ├── runProvidersCommand.ts    ← dispatch to subcommands
    ├── handleListCommand.ts      ← list subcommand handler
    ├── handleSetupCommand.ts     ← setup subcommand handler
    ├── handleEnableCommand.ts    ← enable subcommand handler
    ├── handleDisableCommand.ts   ← disable subcommand handler
    ├── handleRefreshCommand.ts   ← refresh subcommand handler
    └── handleGetCommand.ts       ← get subcommand handler
```

**NexusUserConfig** (in `packages/nexus-runtime/src/config/types.ts`) is extended:

```typescript
providers?: Record<string, { enabled: boolean }>;  // existing: toggle states
providerConfigs?: ProvidersConfig;                  // NEW: connection config
```

### 2. Config Read/Write (`packages/extension-core/src/ai-providers/config/`)

**`readProviderConfig.ts`** — reads `providerConfigs` from `NexusUserConfig` via `readNexusUserConfig()`.
Returns `{}` (empty map) when no providers are configured.

```typescript
/**
 * Reads configured providers from the Nexus user config file.
 *
 * @returns Provider config map, or an empty map when none exist.
 */
export function readProviderConfig(): ProvidersConfig;
```

**`writeProviderConfig.ts`** — reads existing config, merges the new provider config
into `providerConfigs`, and writes back via `writeNexusUserConfig()`.

```typescript
/**
 * Writes a provider config into the Nexus user config file.
 *
 * @param providerId Provider identifier (e.g. "ollama").
 * @param config Provider connection config (host, port, api_key).
 */
export function writeProviderConfig(
  providerId: string,
  config: ProviderConfig,
): void;
```

**`toggleProviderEnabled.ts`** — updates the existing `providers.<id>.enabled` field
in config.json (already has `providers` toggle states for the login picker).

```typescript
/**
 * Enables or disables a provider in the Nexus user config.
 *
 * @param providerId Provider identifier.
 * @param enabled Whether to enable (true) or disable (false).
 */
export function toggleProviderEnabled(
  providerId: string,
  enabled: boolean,
): void;
```

### 3. Gateway Factory (`packages/extension-core/src/ai-providers/gateways/getGateways.ts`)

**NEW** — replaces the hardcoded gateway instantiation in `registerAiProvidersExtension`.
Reads config, builds gateway instances with user-provided URLs/keys, falls back to defaults.

```typescript
/**
 * Builds configured gateway instances from user config.
 *
 * For each provider in config, constructs baseUrl as `http://${host}:${port}`
 * and passes it to the gateway constructor. For providers without config,
 * falls back to the hardcoded default port.
 *
 * @param configuredProviders Provider config map from NexusUserConfig.
 * @returns Array of configured AiGateway instances.
 */
export function getGateways(
  configuredProviders: ProvidersConfig,
): AiGateway[];
```

**Gateway construction logic:**

| Gateway | Default Port | Default URL | API Key Behavior |
|---------|-------------|-------------|------------------|
| `ollama` | 11434 | `http://localhost:11434` | Placeholder `"ollama"` (ignored by server) |
| `lm-studio` | 1234 | `http://localhost:1234` | Optional — empty string if not configured |
| `litellm` | 4000 | `http://localhost:4000` | Required — defaults to `"sk-1234"` (TODO: remove hardcoded default) |

**Config priority:** User config > hardcoded defaults.

### 4. CLI Command Handlers (`apps/tui/src/cli/providers/`)

CLI handlers live in `apps/tui/src/cli/providers/` alongside all other Nexus CLI commands,
dispatched through `runCliWithApp` (matching the pattern used by `sessions`, `observations`, `install`, etc.).
Handlers accept raw `argv: string[]` and use `process.stdout`/`process.stderr` for output.

#### `list` — Display provider table

```typescript
/**
 * Handles the "list" subcommand: displays all providers in a table
 * with columns for provider name, configured (yes/no), and model count.
 *
 * @param argv CLI arguments (e.g. ["--json"]).
 * @returns Exit code.
 */
export async function runProvidersCommand(argv: string[]): Promise<number>;
```

**Table columns:** `Provider Name | Configured | Models Available`

**Logic:**
1. Read all 24 provider definitions from `DEFAULT_PORTS`.
2. For each provider: check if it exists in `providerConfigs` (configured = yes/no).
3. If configured, probe the server via `gateway.exists()` and count models via `gateway.fetchModels()`.
4. Display as a table to stdout (or JSON if `--json` flag is passed).

**Output format (stdout table):**
```
LiteLLM        | Yes      | 12 models
Ollama         | No       | —
LM Studio      | Yes      | 5 models
...
```

#### `setup <provider> <port?> <api_key?>` — Configure a provider

```typescript
/**
 * Handles the "setup" subcommand: configures a provider with host, port, and optional API key.
 *
 * If port is provided, stores it separately from host. If not provided,
 * falls back to the provider's default port. If api_key is provided,
 * stores it. Otherwise prompts for it interactively.
 *
 * @param argv CLI arguments (e.g. ["setup", "ollama", "11434"]).
 * @returns Exit code.
 */
export async function runProvidersCommand(argv: string[]): Promise<number>;
```

**Logic:**
1. Validate `providerId` against known providers (reject unknown ones).
2. Derive host and port: `host = "localhost"` (or prompt for custom host), `port` from CLI arg or default.
3. If `apiKey` not provided, prompt interactively via stdin.
4. Write config via `writeProviderConfig(providerId, { host, port, api_key })`.
5. Notify user: `"Provider '{providerId}' configured at http://${host}:${port}."`

#### `enable <provider>` / `disable <provider>` — Toggle provider

```typescript
/**
 * Handles "enable <provider-id>" and "disable <provider-id>" subcommands.
 * Updates the enabled toggle in config.json and notifies the user.
 *
 * @param argv CLI arguments (e.g. ["enable", "ollama"]).
 * @returns Exit code.
 */
export async function runProvidersCommand(argv: string[]): Promise<number>;
```

**Logic:**
1. Validate provider ID.
2. Call `toggleProviderEnabled(providerId, true/false)`.
3. Output: `"Provider '{providerId}' enabled."` or `"Provider '{providerId}' disabled."`

#### `refresh <provider?>` — Probe and cache models

```typescript
/**
 * Handles the "refresh" subcommand: probes each provider (or a single one)
 * and fetches their available models, updating the model cache.
 *
 * @param argv CLI arguments (e.g. ["refresh", "ollama"]).
 * @returns Exit code.
 */
export async function runProvidersCommand(argv: string[]): Promise<number>;
```

**Logic:**
1. If `providerId` provided: build a single gateway, call `gateway.exists()` then `gateway.fetchModels()`.
2. If no `providerId`: iterate over all configured providers, build each gateway, probe and fetch.
3. Output results: for each provider, show `"Provider: {name} — {N} models found"` or `"Provider: {name} — unreachable"`.

**Per-provider flow:**
- Build gateway from config (or skip if not configured).
- `await gateway.exists()` → if false, skip (output: "Provider '{name}' not running").
- `await gateway.fetchModels()` → filter embedding models (existing behavior).
- Write to model cache (existing `_writeCache` behavior).

#### `get <provider>` — Show provider's models

```typescript
/**
 * Handles the "get" subcommand: displays available models for a configured provider.
 *
 * If the provider is not configured, notifies the user to run setup first.
 * If the provider is configured but unreachable, reports it as offline.
 *
 * @param argv CLI arguments (e.g. ["get", "ollama"]).
 * @returns Exit code.
 */
export async function runProvidersCommand(argv: string[]): Promise<number>;
```

**Logic:**
1. Check if provider is in `providerConfigs`. If not: output `"Provider '{providerId}' is not configured. Run 'dev provider setup {providerId}' to configure it."`
2. Build gateway from config.
3. Probe via `gateway.exists()`. If unreachable: output `"Provider '{providerId}' is not running at {url}."`
4. If reachable: `await gateway.fetchModels()` and display model list.

### 5. Slash Command Registration

Register a `/dev-provider` slash command (group: "Nexus") that dispatches to the CLI handlers.
The slash command handler reads TUI context (input, notify) and delegates to the same
handler logic used by the CLI — just with a TUI adapter instead of raw `argv`.

```typescript
// apps/tui/src/cli/providers/registerDevProviderCommand.ts

export function registerDevProviderCommand(pi: ExtensionAPI): void {
  pi.registerCommand("dev-provider", withSlashMenuGroup({
    description: "Manage local LLM providers (list, setup, enable, disable, refresh, get).",
    handler: async (args, ctx) => {
      // Parse subcommand from args (e.g. "list", "setup ollama 11434")
      // Dispatch to the appropriate handler via a TUI-adapted context.
    },
  }));
}
```

### 6. Integration with `registerAiProvidersExtension`

Modify `registerAiProvidersExtension` to use `getGateways()` instead of hardcoded construction:

```typescript
// BEFORE (current):
const gateways = [
  new LiteLLmGateway(),
  new LmStudioGateway(),
  // ...
];

// AFTER (new):
const providerConfig = readProviderConfig();
const gateways = getGateways(providerConfig);
```

This ensures configured providers (with user host/port) take priority over hardcoded defaults.

### 7. CLI Entry Point (`just dev provider <command>`)

The `just dev provider` convenience alias invokes `nexus` with the provider subcommand flags, which `runCliWithApp` dispatches to `apps/tui/src/cli/providers/runProvidersCommand.ts`.

```bash
just dev provider list
just dev provider setup ollama 11434
just dev provider setup litellm 4000 sk-xxx
just dev provider setup lm-studio 1234
just dev provider enable ollama
just dev provider disable lm-studio
just dev provider refresh
just dev provider refresh ollama
just dev provider get ollama
```

## Implementation Order

1. **Config types** — Extend `NexusUserConfig` with `providerConfigs`.
2. **Config read/write** — Implement `readProviderConfig`, `writeProviderConfig`, `toggleProviderEnabled`.
3. **Gateway factory** — Implement `getGateways()` that reads config and builds gateways.
4. **Update `registerAiProvidersExtension`** — Use `getGateways()` instead of hardcoded construction.
5. **CLI handlers** — Implement all 6 command handlers in `apps/tui/src/cli/providers/` (`list`, `setup`, `enable`, `disable`, `refresh`, `get`).
6. **Register in `runCliWithApp`** — Wire `hasProvidersFlag` / `runProvidersCommand` into the CLI dispatch chain.
7. **Slash command** — Register `/dev-provider` command with subcommand dispatch.
8. **Tests** — Unit tests for config read/write, handler logic, gateway factory.

## Files Created

```
packages/extension-core/src/ai-providers/
├── config/
│   ├── index.ts
│   ├── types.ts            ← ProviderConfig, ProvidersConfig
│   ├── readProviderConfig.ts
│   ├── writeProviderConfig.ts
│   └── toggleProviderEnabled.ts
├── gateways/
│   └── getGateways.ts      ← NEW: config-driven gateway factory
apps/tui/src/cli/
└── providers/
    ├── index.ts
    ├── hasProvidersFlag.ts       ← flag checker (hasProvidersFlag)
    ├── parseProvidersCommand.ts  ← argument parser (parseProvidersCommand)
    ├── ProvidersCommandOptions.ts ← options type
    ├── printProvidersHelp.ts     ← usage text (printProvidersHelp)
    ├── runProvidersCommand.ts    ← dispatch to subcommands
    ├── handleListCommand.ts
    ├── handleSetupCommand.ts
    ├── handleEnableCommand.ts
    ├── handleDisableCommand.ts
    ├── handleRefreshCommand.ts
    └── handleGetCommand.ts
```

## Files Modified

| File | Change |
|------|--------|
| `packages/nexus-runtime/src/config/types.ts` | Add `providerConfigs?: ProvidersConfig` to `NexusUserConfig` |
| `packages/extension-core/src/ai-providers/gateways/index.ts` | Export `getGateways` |
| `packages/extension-core/src/ai-providers/registerAiProvidersExtension.ts` | Use `getGateways(readProviderConfig())` instead of hardcoded construction |
| `apps/tui/src/cli/runCliWithApp.ts` | Add provider command dispatch (`hasProvidersFlag` / `runProvidersCommand`) |
| `packages/feature-flags/src/registry.ts` | Add `"dev-provider"` feature flag entry |
| `packages/feature-flags/src/createExtensionRegisterMap.ts` | Register `dev-provider` extension |

## Risks & Mitigations

- **Hardcoded LiteLLM key:** The existing `LiteLLmGateway` defaults to `"sk-1234"`. The `setup` handler should warn users to replace it. **TODO:** Remove hardcoded default once config is in place.
- **Ollama port typo:** The existing `OllamaGateway` uses `11234` instead of `11434`. This is a pre-existing bug — fix it in this PR.
- **No providers configured:** `getGateways({})` returns gateways with hardcoded default URLs. This is the current behavior, so no regression.
- **CLI location:** Provider CLI handlers live in `apps/tui/src/cli/providers/` (not `packages/extension-core/src/ai-providers/cli/`), dispatched through `runCliWithApp` alongside all other Nexus CLI commands (sessions, observations, install, etc.). The slash command in `registerDevProviderCommand` reuses the same handler logic with a TUI context adapter.
