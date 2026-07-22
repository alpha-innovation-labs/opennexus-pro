# Plan: Async model cache for local AI gateways

## Background & investigation

### The original symptom

`just dev` startup takes ~1.4s wall-clock. The startup-profile log reveals two dominant phases:

- **`importBundledExtensions`** — 306ms (module imports)
- **`ai-providers:register`** — 234ms (network probes)

The 234ms AI provider cost comes from `AiGateway.registerProvider()` calling `this.getModels()` synchronously at registration time. Each gateway (LiteLLM, LM Studio) fires an HTTP request to its `/v1/models` endpoint. Neither server runs during development, so each request fails/times out. The 234ms is aggregate network wait across both gateways.

The code comment admits: *"Fetches models at registration time so Pi does not fall back to its built-in catalog."* — every startup blocks on network probes to local servers that don't exist.

### Goal

Eliminate the blocking network call from startup while preserving model availability. Cache models asynchronously in the background and serve from cache on subsequent reads.

## Design

### Cache location

Cache file: `<agentDir>/cache/available_models.json`

The agent directory is resolved by `getAgentDirPath()` (already used throughout the codebase):

1. Checks `NEXUS_CODING_AGENT_DIR` env var
2. Falls back to `PI_CODING_AGENT_DIR` env var
3. Default: `~/.local/share/nexus/agent`

So the cache path resolves to: `~/.local/share/nexus/agent/cache/available_models.json`

The `ensureAgentDirEnv()` call at app startup (line 78 of `runAppWithExtensionFactories.ts`) already creates the agent directory, so we only need to ensure the `cache/` subdirectory exists.

### Cache file format

```json
{
  "litellm": [
    { "id": "qwen3.5-32b", "name": "qwen3.5-32b", "reasoning": false, "input": ["text"], "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }, "contextWindow": 128000, "maxTokens": 8192 }
  ],
  "lm-studio": [
    { "id": "llama-3.1-8b", "name": "llama-3.1-8b", ... }
  ]
}
```

Structure: `{ providerId: ProviderConfigInput["models"][] }`.

### API changes to `AiGateway`

Current `AiGateway` (in `packages/extension-core/src/ai-providers/AiGateway.ts`):

```
getModels(): Promise<ProviderConfigInput["models"]>  // async, network call
registerProvider(pi): Promise<void>                   // awaits getModels() synchronously
```

New API:

```
getModels(): ProviderConfigInput["models"]            // sync, returns from cache (or [])
refreshModels(context): Promise<ProviderConfigInput["models"]>  // async, fetch + cache write
```

### Implementation steps

#### 1. Add cache path resolver

Create `packages/extension-core/src/ai-providers/cache/getModelCachePath.ts`:

```ts
import { getAgentDirPath } from "@nexus/runtime/config/getAgentDirPath.js";
import { join } from "node:path";

export function getModelCachePath(): string {
  return join(getAgentDirPath(), "cache", "available_models.json");
}
```

#### 2. Add cache read/write utilities

Create `packages/extension-core/src/ai-providers/cache/readModelCache.ts` and `packages/extension-core/src/ai-providers/cache/writeModelCache.ts`:

- `readModelCache()`: reads and parses the JSON file, returns `{ providerId: models[] }` or `{}` if file doesn't exist.
- `writeModelCache(data)`: ensures `cache/` directory exists (mkdir -p equivalent), writes JSON atomically.

#### 3. Modify `AiGateway`

Changes to `packages/extension-core/src/ai-providers/AiGateway.ts`:

a. Add private fields:
```ts
private _cachedModels: ProviderConfigInput["models"] | null = null;
private _cacheWritePromise: Promise<void> | null = null;
```

b. Add private `_warmCache()` method:
- Reads existing cache (if any)
- Fetches models from this gateway via `getModels()`
- Merges new models into cache data
- Writes to `cache/available_models.json`
- Sets `_cachedModels`

c. Modify `getModels()`:
- If `_cachedModels` is set, return it (cache hit, sync)
- If not, return `[]` (cache miss, non-blocking)

d. Modify `registerProvider()`:
- Remove `await this.getModels()`
- Register with empty models `[]`
- Start fire-and-forget `this._warmCache()` (no await, no error handling — failures are silent)

#### 4. Wire cache into `registerAiProvidersExtension`

No changes to `packages/extension-core/src/ai-providers/registerAiProvidersExtension.ts` are needed — the gateway API surface stays the same. Gateways are still instantiated and registered identically.

### Edge cases

- **Concurrent writes**: `_cacheWritePromise` deduplicates concurrent `_warmCache()` calls. Only one write in flight at a time.
- **First run**: Cache file doesn't exist. `getModels()` returns `[]`. `_warmCache()` fires in background. If the background write succeeds, subsequent `getModels()` calls return cached data.
- **Stale cache**: No invalidation by default (TTL not implemented). Cache persists until the user clears it or the file is manually edited.
- **Network failure during warm**: `_warmCache()` swallows errors silently. The gateway registers with empty models, which is the current behavior anyway.
- **Manual refresh**: The existing `refreshModels` callback at `registerProvider` line 150 invokes `this.getModels()` (async). This will still work — it fetches fresh and updates the cache.

### Files to create

| File | Purpose |
|------|---------|
| `packages/extension-core/src/ai-providers/cache/getModelCachePath.ts` | Resolves cache file path from agent dir |
| `packages/extension-core/src/ai-providers/cache/readModelCache.ts` | Reads and parses cache JSON |
| `packages/extension-core/src/ai-providers/cache/writeModelCache.ts` | Writes cache JSON (creates cache/ dir) |
| `packages/extension-core/src/ai-providers/cache/index.ts` | Re-exports |

### Files to modify

| File | Change |
|------|--------|
| `packages/extension-core/src/ai-providers/AiGateway.ts` | Add cache fields, sync `getModels()`, fire-and-forget `_warmCache()` |
| `packages/extension-core/src/ai-providers/gateways/index.ts` | Add cache re-exports |

### Files NOT touched

- `packages/extension-core/src/ai-providers/registerAiProvidersExtension.ts` — no changes needed
- `packages/extension-core/src/ai-providers/gateways/litellm.ts` — no changes needed
- `packages/extension-core/src/ai-providers/gateways/lm-studio.ts` — no changes needed

## Validation

Run `just dev-profile` before and after. Expect:

| Metric | Before | After |
|--------|--------|-------|
| Wall-clock startup | ~1.4s | ~0.8s (remove 234ms network wait) |
| `ai-providers:register` duration | 234ms | <5ms (sync cache read only) |
| `importBundledExtensions` duration | 306ms | ~306ms (unchanged) |

The 306ms extension import cost remains — that's module resolution, not network.

## Risks

- **Cache corruption**: If the JSON file is malformed, `readModelCache` should return `{}` gracefully.
- **First-run UX**: Users see "no models" briefly until `_warmCache()` completes. This is acceptable — the background fetch is non-blocking and the existing `refreshModels` callback handles on-demand refresh.
- **Multiple gateways**: Each gateway's `_warmCache()` runs independently and concurrently. They all write to the same file, so `writeModelCache` must handle concurrent appends safely (append-only merge strategy).
