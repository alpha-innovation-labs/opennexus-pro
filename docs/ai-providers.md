# AI Providers

A two-layer system for managing local LLM inference servers:

1. **`packages/extension-core/src/ai-providers/`** — Core library: gateway abstraction, model caching, config persistence, and Pi registration.
2. **`apps/tui/src/cli/providers/`** — CLI surface: subcommand parsing, interactive configuration, and tabular status display.

---

## 1. Core Library (`packages/extension-core/src/ai-providers/`)

### 1.1 Configuration Types

**`config/types.ts`**

| Type | Description |
|------|-------------|
| `ProviderConfig` | `{ host, port, api_key?, enabled? }` — connection config for one provider. Stored in `~/.config/nexus/config.json` under `providers`. |
| `ProvidersConfig` | `Record<string, ProviderConfig>` — map keyed by provider ID (e.g. `{ ollama: { host, port } }`). |

### 1.2 Config Read / Write

| Function | File | Purpose |
|----------|------|---------|
| `readProviderConfig()` | `config/readProviderConfig.ts` | Reads `providers` from `config.json`, filters to entries with `host` + `port` (skips `{ enabled: false }` stubs). |
| `writeProviderConfig(id, config)` | `config/writeProviderConfig.ts` | Merges a `ProviderConfig` into `config.json` under `providers[id]`. |
| `toggleProviderEnabled(id, enabled)` | `config/toggleProviderEnabled.ts` | Sets `providers[id].enabled = true|false` (creates entry if missing). |

### 1.3 Constants — Default Ports

**`constants/default-ports.ts`** — 26 known providers with default ports:

```
vllm: 8000,  ollama: 11434,  llama.cpp: 8080,  localai: 8080,  sglang: 30000,
jan: 1337,   llamafile: 8080, tensorrt-llm: 8000, lmddeploy: 23333, mlx-lm: 8080,
mlx-openai-server: 8080, omlx: 8000, lemonade: 8080, docker-model-runner: 8000,
koboldcpp: 5001, exllamav2: 5000, gpt4all: 4891, h2ogpt: 5000,
text-generation-webui: 7860, open-webui: 3000, litellm: 4000, harbor: 3000,
openllm: 3000, lm-studio: 1234
```

### 1.4 Gateway Abstraction

**`gateway/gateway.ts`** — `AiGateway` class:

| Method | Description |
|--------|-------------|
| `exists()` | Probes `/v1/models` → returns `GatewayProbeResult`: `{ status: "ok"|"access-denied"|"unreachable"|"error" }`. |
| `getModels()` | Reads cached models only (no network). Returns `[]` if no cache entry. |
| `refreshModels(context)` | Fetches live models, writes cache, returns list. |
| `registerProvider(pi, modelsOverride?)` | Registers with Pi extension API — sync registration + fire-and-forget warm. |

**`gateway/createGateway(id, options)`** — Factory that looks up `PROVIDER_NAMES` and `DEFAULT_PORTS`, then returns `new AiGateway(...)`. Throws if `id` has no default port.

**`gateway/getGateways(configuredProviders)`** — Builds `AiGateway[]` from `ProvidersConfig` by iterating entries and calling `createGateway()` for each.

**`gateway/types.ts`** — `GatewayOptions`, `GatewayProbeResult`, `defaultPort()`, `baseUrlFromPort()`.

### 1.5 Model Discovery

**`gateway/model-discovery.ts`**

| Function | Purpose |
|----------|---------|
| `fetchModelsFromGateway(baseUrl, apiKey?)` | GETs `/v1/models`, filters out embedding models (IDs containing `embed`, `text-embedding`, `clip`, `bge`, `mxbai`, `nomic-embed`), returns remaining with default metadata (`contextWindow: 128000, maxTokens: 8192`). Returns `[]` on failure. |
| `isEmbeddingModel(id)` | Regex match for embedding model IDs. |

### 1.6 Caching

**`cache/providerStateCache.ts`**

| Function | Purpose |
|----------|---------|
| `readProviderStateCache(cachePath)` | Reads `{ providerId: Model[] }` from JSON. Silently returns `{}` on parse failure. Ignores old probe+models format. |
| `writeProviderStateCache(cachePath, data)` | Writes JSON, creating `cache/` dir if needed. |

**`gateway/cache.ts`** — Higher-level cache ops:

| Function | Purpose |
|----------|---------|
| `getModels(providerId)` | Pure cache read — returns cached models or `[]`. |
| `resolveModels(providerId, baseUrl, apiKey?)` | Cache hit → return. Cache miss → fetch live, write cache, return. |
| `refreshModels(providerId, baseUrl, apiKey?)` | Always fetch live, write cache, return. |
| `writeSingleGatewayCache(cachePath, providerId, models)` | Internal — updates one provider entry in the cache file. |

### 1.7 Provider Registration

**`gateway/provider-registration.ts`** — Registers a gateway with Pi (sync), registers a `refreshModels` callback for on-demand refresh.

**`register-ai-providers/buildGateways()`** — Thin wrapper around `getGateways()`.

---

## 2. CLI Surface (`apps/tui/src/cli/providers/`)

### 2.1 Command Pipeline

```
runCliWithApp()
  └── hasProvidersFlag(argv)
        └── runProvidersCommand(argv)
              ├── parseProvidersCommand(argv)  → ProviderSubcommand
              ├── readProviderConfig()         → ProvidersConfig
              └── getGateways(config)          → AiGateway[]
                    └── switch on request.action
                          handleListCommand()
                          handleSetupCommand()
                          handleConfigureCommand()
                          handleEnableCommand()
                          handleDisableCommand()
                          handleRefreshCommand()
                          handleGetCommand()
```

### 2.2 Subcommand Parsing

**`parseProvidersCommand(argv)`** → `{ request: ProviderSubcommand } | { error: string }`

`ProviderSubcommand` is a discriminated union:

| Action | Fields |
|--------|--------|
| `list` | `{ action: "list"; json: boolean }` |
| `setup` | `{ action: "setup"; providerId: string; port?, apiKey? }` |
| `configure` | `{ action: "configure"; providerId?, host?, port?, apiKey? }` |
| `enable` | `{ action: "enable"; providerId: string }` |
| `disable` | `{ action: "disable"; providerId: string }` |
| `refresh` | `{ action: "refresh"; providerId? }` |
| `get` | `{ action: "get"; providerId: string }` |

### 2.3 Subcommand Handlers

| Handler | File | Description |
|---------|------|-------------|
| `runProvidersCommand()` | `runProvidersCommand.ts` | Entry point — parses, reads config, builds gateways, dispatches by `action`. |
| `handleListCommand(json, gateways)` | `handleListCommand.ts` | Displays all providers in a colored table: Provider, Enabled, Reachable, Authorized, Models. Sort: green (enabled+reachable+authorized) > orange (reachable+not-authorized) > red (not-reachable) > gray (disabled). |
| `handleSetupCommand(providerId, port?, apiKey?)` | `handleSetupCommand.ts` | Non-interactive — validates provider ID, derives default port, writes config at `http://localhost:<port>`. |
| `handleConfigureCommand(providerId?, cliHost?, cliPort?, cliApiKey?)` | `handleConfigureCommand.ts` | Interactive — fuzzy-filtered provider picker (`@clack/prompts`), then prompts for host/port/API key with retry loop until probe succeeds. Pre-fills existing config. |
| `handleEnableCommand(providerId)` | `handleEnableCommand.ts` | Validates ID, calls `toggleProviderEnabled(id, true)`. |
| `handleDisableCommand(providerId)` | `handleDisableCommand.ts` | Validates ID, calls `toggleProviderEnabled(id, false)`. |
| `handleRefreshCommand(providerId?, gateways?)` | `handleRefreshCommand.ts` | Probes each configured gateway (`exists()` + `refreshModels()`), displays colored status table, writes models to cache. |
| `handleGetCommand(providerId, gateways?)` | `handleGetCommand.ts` | Shows models for one provider in a table: Model, Reasoning, Input, Context, MaxTokens. |
| `getAllProviderIds()` | `getAllProviderIds.ts` | Returns `Object.keys(DEFAULT_PORTS).sort()`. |
| `printProvidersHelp()` | `printProvidersHelp.ts` | Prints usage help text. |

### 2.4 CLI Usage

```bash
nexus provider list [--json]
nexus provider setup <provider> [port] [api_key]
nexus provider configure [--host <host>] [--port <port>] [--api-key <key>] [<provider>]
nexus provider enable <provider>
nexus provider disable <provider>
nexus provider refresh [<provider>]
nexus provider get <provider>
```

---

## 3. Data Flow

### 3.1 Configuration Persistence

```
User config.json (providers section)
  └── readProviderConfig() → ProvidersConfig (host+port entries only)
  └── writeProviderConfig(id, config) → merge into config.json
  └── toggleProviderEnabled(id, enabled) → set providers[id].enabled
```

### 3.2 Model Caching

```
{agentDir}/cache/available_models.json
  └── readProviderStateCache() → ProviderStateCache
  └── writeProviderStateCache(data) → persist
  └── getModels(id) → cache read only
  └── resolveModels(id, url, key) → cache read, live fetch on miss
  └── refreshModels(id, url, key) → always live fetch + write
```

### 3.3 Gateway Lifecycle

```
User config (host, port)
  └── getGateways(config) → AiGateway[]
        └── createGateway(id, { baseUrl, apiKey })
              └── new AiGateway({ providerId, name, baseUrl, apiKey, api, apiPath })
                    └── exists() → GatewayProbeResult (probe)
                    └── getModels() → cache read
                    └── refreshModels(ctx) → live fetch + cache write
                    └── registerProvider(pi) → register with Pi
```

### 3.4 Probe Result States

| Status | Meaning |
|--------|---------|
| `ok` | HTTP 200-299, body matches OpenAI `/v1/models` contract (`{ data: [{ object: "model" }] }`) |
| `access-denied` | Non-2xx response — server IS an AI provider, but auth rejected (401/403) |
| `unreachable` | Connection error (DNS failure, connection refused, timeout) |
| `error` | Server responded with non-2xx, no model data |

---

## 4. Known Providers (26)

| Provider | Default Port |
|----------|-------------|
| vLLM | 8000 |
| Ollama | 11434 |
| llama.cpp | 8080 |
| LocalAI | 8080 |
| SGLang | 30000 |
| Jan AI | 1337 |
| llamafile | 8080 |
| TensorRT-LLM | 8000 |
| LMDeploy | 23333 |
| MLX-LM | 8080 |
| mlx-openai-server | 8080 |
| oMLX | 8000 |
| Lemonade | 8080 |
| Docker Model Runner | 8000 |
| KoboldCpp | 5001 |
| exllamav2 | 5000 |
| GPT4All | 4891 |
| h2oGPT | 5000 |
| text-generation-webui | 7860 |
| open-webui | 3000 |
| LiteLLM | 4000 |
| Harbor | 3000 |
| OpenLLM | 3000 |
| LM Studio | 1234 |
