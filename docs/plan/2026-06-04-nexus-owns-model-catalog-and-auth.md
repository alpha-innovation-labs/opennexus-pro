# Plan: Nexus owns the model catalog and the auth

## Background & investigation

### The original symptom

`just dev` opens the bundled Pi TUI through the Nexus extension layer. The model list the user sees in the `/model` picker is built by Pi's `ModelRegistry` and feeds off Pi's bundled registry in `@earendil-works/pi-ai` v0.78.0.

Nexus registers the `minimax-code` and `minimax-code-cn` providers via `registerOhMyPiProvider` → `createBundledProviderModelConfigs("minimax")` → `getModels("minimax")` from `@earendil-works/pi-ai`. That bundled file (`node_modules/@earendil-works/pi-ai/dist/models.generated.js:5509-5580`) only contains `MiniMax-M2.7` and `MiniMax-M2.7-highspeed` for both `minimax` and `minimax-cn`. `MiniMax-M3` is **not** in that file.

`opencode` shows M3 because it fetches the live catalog from `https://models.dev/api.json` at runtime. Nexus does not. Going forward, **Nexus will fetch models at runtime every time the user invokes `/model`** — lazily, on-demand — rather than relying on Pi's bundled registry or maintaining a static hand-curated file.

### Pi's bundled catalog is stale

Pi ships a curated model bundle in `@earendil-works/pi-ai` (~35 providers, 964 models). That bundle is built at Pi's release time from `https://models.dev/api.json`, but it lags behind reality by days or weeks because it requires a new npm publish.

The relevant commit on Pi's `main`:

```
2026-06-02 — Add MiniMax-M3 to direct minimax providers
```

`@earendil-works/pi-ai@0.78.0` was published to npm on **2026-05-29**, four days before the M3 commit landed. v0.78.0 is still the latest dist-tag on npm. So the bundled registry in our installed copy is missing M3, and there's no patch release we can bump to.

Nexus will side-step this entirely by fetching the live catalog at `/model` time. The provider list (which providers exist, their auth type, base URLs, etc.) is hardcoded in-repo, but the **models are fetched fresh on every `/model` invocation**. No more stale bundles, no more waiting for Pi releases.

### Why the "All models" tab is missing M3 too

The `/model` picker has two tabs, and they're fed by two different code paths:

| Tab                | Source                                                                   | Filter                          |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------- |
| "Models" (default) | `createAvailableModelLeaves(ctx)` → `ctx.modelRegistry.getAvailable()`        | Authenticated only              |
| "All models"       | `createModelCatalogLeaves()` → `getProviders()` + `getModels(provider)` from `@earendil-works/pi-ai` | Nothing — full bundled registry |

`createModelCatalogLeaves.ts:1` imports `getModels, getProviders` directly from `@earendil-works/pi-ai` and walks the **bundled** registry, completely bypassing both Pi's `ModelRegistry` and the Nexus extension layer. This is why the "All models" tab's search is missing M3 even if Nexus injected it via `pi.registerProvider` — the tab isn't reading from anything Nexus controls.

### The auth-type split (subscriptions vs API keys)

Pi's `/login` shows two distinct categories, classified by `isApiKeyLoginProvider` in `node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/interactive-mode.js:121`:

```ts
isApiKeyLoginProvider(providerId, oauthProviderIds, builtInProviderIds) {
  if (BUILT_IN_PROVIDER_DISPLAY_NAMES[providerId]) return true;
  if (builtInProviderIds.has(providerId)) return false;
  return !oauthProviderIds.has(providerId);
}
```

- **OAuth (subscriptions)**: providers registered with `oauth: ...`. Built-in: `anthropic`, `github-copilot`, `openai-codex`. The OAuth flow ends in a multi-step browser flow; the credential is `{ type: "oauth", access, refresh, expires }`.
- **API keys**: providers that have models registered but no `oauth` field. Login is a single prompt; the key is stored as `{ type: "api_key", key }` via `authStorage.set(providerId, { type: "api_key", key: apiKey })` at `interactive-mode.js:3966`.

The current `packages/extension-core/src/ai-providers/oauth/createManualOAuthProvider.ts` registers all 39 Nexus providers as OAuth (via `pi.registerProvider(..., { oauth: createManualOAuthProvider(definition) })`). This routes them all through the subscription path, even when the `credentialLabel` is "API key". That's why `/login` shows only the subscription view of Nexus providers — `isApiKeyLoginProvider` returns `false` for them because they ARE registered as OAuth.

**Nexus will fix this by hard-coding `authType: "oauth" | "api_key"` directly in `AiProviderDefinition`.** Each provider in `ohMyPiProviderDefinitions.ts` gets an explicit `authType`. The registration logic (`registerOhMyPiProvider`) then branches: API-key providers are registered without an `oauth` field (so Pi treats them as API-key providers), and OAuth providers keep the existing `createManualOAuthProvider` behavior. This makes the `/login` categorization correct without relying on Pi's heuristics.

### We already do "Nexus overrides Pi's bundle" — the Cursor pattern

The `ai-providers` extension is exactly the layer where this kind of work belongs. The Cursor subtree (13 files under `packages/extension-core/src/ai-providers/register/`) is the precedent:

- `createCursorProviderWithoutFallbackApi.ts` — `Proxy` on `pi.registerProvider` that **strips Pi's bundled Cursor model list** and replaces it with `models: []`.
- `registerLiveCursorModels.ts` — fires off a live fetch from Cursor's API the moment credentials are resolved.
- `cursorStoredModelLoader.ts` / `registerStoredCursorModels.ts` — caches the live result on disk and reuses it on next boot.
- `getCursorModelsSilently.ts` / `shouldSuppressCursorModelDiscoveryWarning.ts` — fail-quiet when the network is down.

That's the same pattern as "override Pi's bundled list with a fresh source." The Cursor path validates the architecture for "Nexus overrides Pi's bundled list." In our case, the fresh source is a **live runtime fetch** (just like Cursor's live fetch) rather than a static in-repo file.

### M3 spec

| Field | Value |
| --- | --- |
| id | `MiniMax-M3` |
| name | `MiniMax-M3` |
| api | `anthropic-messages` (baseUrl is the Anthropic-compatible endpoint) |
| provider | `minimax` (international) / `minimax-cn` (China) |
| baseUrl (intl) | `https://api.minimax.io/anthropic` |
| baseUrl (cn) | `https://api.minimaxi.com/anthropic` |
| reasoning | `true` |
| input modalities | `text`, `image`, `video` |
| output modalities | `text` |
| contextWindow | `512000` |
| maxTokens | `128000` |
| cost.input | `0.6` |
| cost.output | `2.4` |
| cost.cacheRead | `0.12` |
| cost.cacheWrite | `0.12` (derived from cacheRead for parity) |
| release_date | `2026-06-01` |

`ProviderModelConfig.input` in `node_modules/@earendil-works/pi-coding-agent/dist/core/model-registry.d.ts:137` is typed as `("text" | "image")[]`, so `video` is dropped from the `input` field on registration; the `attachment: true` signal preserves the capability for the UI.

### Why this plan exists

The original M3 fix was a thin patch (a static `nexusProviderModelExtras` map, a merger, an async loader). It worked but didn't fix the underlying problem: Nexus depends on Pi's bundled registry for the picker and the auth UX, and that registry lags reality by 4+ days per Pi release cycle.

The right answer is for Nexus to own the catalog and the auth entirely. Nexus maintains a **hardcoded provider registry** (which providers exist, their auth type, base URLs) in-repo, but **fetches model lists at runtime** when the user runs `/model`. This gives us fresh data on every invocation, full control over the provider list, and zero dependency on Pi's release cycle.

M3 appears immediately because the fetch happens at `/model` time against a live endpoint, not from a bundled file.

---

## Scope (today's decision recap)

1. **Catalog source**: hardcoded provider registry in-repo (`nexusProviderRegistry.ts`) — which providers exist, their auth type, base URLs, etc. **Models are fetched at runtime** every time the user invokes `/model`, from a live endpoint (e.g. `https://models.dev/api.json`). No static model list.
2. **Picker ownership**: Nexus owns the `/model` picker (both tabs). Pi's `ModelRegistry` is bypassed for the picker UI; we still inject models into it for Pi's runtime.
3. **Provider list**: Nexus maintains its own provider registry. The scope is similar to `https://omp.sh/docs/providers` but independently managed and curated by Nexus. We create provider connections ourselves; Pi is used only for the inference core.
4. **Auth**: Nexus owns auth end-to-end for all API-key providers and for Nexus-managed OAuth providers. For the five Pi-native OAuth providers (`anthropic`, `github-copilot`, `openai-codex`, `google-gemini-cli`, `google-antigravity`), Pi continues to execute its built-in browser OAuth flow and writes the resulting credential into `~/.local/share/nexus/agent/auth.json`. Pi's runtime then reads the credential back from the same file. This is the only Pi-native exception; every other provider is fully managed by Nexus.
5. **No automatic migration**: Nexus does NOT read `~/.pi/agent/auth.json` on first boot. Users who want to import existing Pi auth use the existing `/login` → "Import from Pi" slash-menu flow.
6. **Picker scope**: only models from providers the user has auth for in the "Models" tab. The "All models" tab shows the full catalog (no auth filter).
7. **Auth-type classification**: hard-coded in `AiProviderDefinition` as `authType: "oauth" | "api_key"`. Each provider is explicitly classified. API-key providers are registered without an `oauth` field so Pi's `/login` shows them in the API-key section.

---

## Architectural shift

### Today

```
models.dev (network) ──┐
                       │  (build time, only for the website)
                       ▼
            Pi's generate-models.ts (Pi's repo)
                       │
                       ▼
       @earendil-works/pi-ai@0.78.0 (npm release)
                       │
                       ▼
       Pi's dist/models.generated.js (BUNDLED)
                       │
       ┌───────────────┴────────────────────┐
       │                                    │
       ▼                                    ▼
 getModels("minimax")              getProviders() + getModels(p)
 (Nexus ohMyPiProvider,            ("All models" tab in
 injected into Pi's registry)      the /model picker — direct,
                                   bypasses Pi's registry)
       │                                    │
       ▼                                    ▼
   pi.registerProvider                createModelCatalogLeaves
   ("minimax-code", { models, oauth })  (no Nexus involvement)
       │
       ▼
  Pi's ModelRegistry
  (runtime + "Models" tab)

  ~/.pi/agent/auth.json  ←─ Pi owns, Nexus reads (slashusage)
```

### After

```
          nexusProviderRegistry.ts (hardcoded, in-repo)
                          │
                          ▼
              nexusModelCatalogFetcher.ts  ──►  models.dev/api.json (runtime fetch)
                          │
                          ▼
              NexusModelCatalogStore (async, subscribable)
              ┌────────────┬────────────┬─────────────────────┐
              │            │            │                     │
              ▼            ▼            ▼                     ▼
   /model "Models"   /model "All    pi.registerProvider    Nexus auth resolution
   tab (auth filter)  models" tab    (write-through for     (priority chain:
                     (full catalog)  Pi's runtime use)     runtime > nexus file
                                                                > fallback)
                                                         Pi's runtime
                                                                    │
                                                                    │
                                                   Pi's authStorage (read-through adapter)
                                                                    │
                                                                    │
                                                   ~/.local/share/nexus/agent/auth.json
                                                                    ▲
                                                                    │
```

Three things change:
1. Nexus has its own **async catalog store** populated by a runtime fetch on every `/model` invocation (the source of truth for the picker — **both tabs**).
2. Nexus has its own auth store (the source of truth for credentials).
3. Pi's `ModelRegistry` receives the full catalog from Nexus for runtime use, and Pi's `authStorage` becomes a read-through adapter into `NexusAuthStorage`.

The "All models" tab, which today reaches around Nexus into Pi's bundled registry, becomes a second consumer of `NexusModelCatalogStore` (the full fetched catalog, no auth filter). This is what brings `MiniMax-M3` and every other newly-shipped model into both tabs immediately — no release cycle, no static file updates.

The bridge is one-way for everything except those five Pi-native OAuth providers: Nexus → Pi for model catalog and API-key auth; Pi → Nexus auth file for the native OAuth exception. We never read Pi's `authStorage` or Pi's `ModelRegistry` for the picker (only for runtime, indirectly via the models we inject after fetch).

---

## Module layout

New files in `packages/extension-core/src/ai-providers/`:

```
ai-providers/
├── model-catalog/
│   ├── NexusModelCatalog.ts          # types: NexusModel, NexusProvider, NexusModelCatalog
│   ├── nexusProviderRegistry.ts      # hardcoded provider metadata (id, authType, baseUrl, api) — NO models
│   ├── nexusModelCatalogStore.ts     # in-memory store with subscribers
│   ├── listNexusAuthProviders.ts     # filters catalog to providers with auth
│   └── injectNexusCatalogIntoPi.ts   # walks Nexus catalog, calls pi.registerProvider
├── auth/
│   ├── NexusAuthStorage.ts           # reads/writes ~/.local/share/nexus/agent/auth.json
│   ├── nexusAuthBridge.ts            # read-through adapter: Pi authStorage reads from NexusAuthStorage
│   └── nexusAuthResolve.ts           # priority chain for resolving a credential
├── model/
│   ├── ...existing files...
│   └── AiProviderDefinition.ts       # updated: adds authType field
├── register/
│   ├── ...existing files...
│   ├── registerOhMyPiProvider.ts     # updated: branches on authType; registers provider skeleton
│   └── registerNexusModelCatalog.ts  # extension entrypoint: sets up auth bridge; fetches + injects models on /model
└── ...
```

New files for the picker and command:

```
packages/extension-core/src/slash-menu/
├── model-catalog/
│   ├── NexusModelPickerModal.ts
│   ├── createNexusModelPickerLeaves.ts       # replaces BOTH createAvailableModelLeaves and createModelCatalogLeaves
│   └── formatNexusModelRow.ts
└── ...
```

Tests under `test/extensions/ai-providers/...` and `test/extensions/slash-menu/...`.

---

## Phase 1: Nexus-owned model catalog (lazy runtime fetch)

### Step 1.1 — `NexusModelCatalog` types

```ts
type NexusModel = {
  id: string;            // "MiniMax-M3"
  name: string;          // "MiniMax-M3"
  provider: string;      // "minimax"  (NOT "minimax-code" — that's the Nexus alias)
  api: Api;              // "anthropic-messages"
  baseUrl: string;       // "https://api.minimax.io/anthropic"
  contextWindow: number;
  maxTokens: number;
  cost: { input: number; output: number; cacheRead: number; cacheWrite: number };
  reasoning: boolean;
  input: ("text" | "image")[];   // pi-ai typing; video/pdf dropped, kept in `attachment` flag
  attachment: boolean;            // true if modalities.input includes image/video/pdf
  openWeights: boolean;
  releaseDate: string;            // for sorting / "new" badge in picker
};

type NexusProviderDefinition = {
  id: string;                    // "minimax"
  name: string;                  // "minimax (minimax.io)"
  baseUrl: string;
  npm: string;                   // "@ai-sdk/anthropic"
  api: string;                   // default api type for this provider
  doc?: string;
  authType: "oauth" | "api_key";
};

type NexusModelCatalog = {
  version: 1;
  fetchedAt: string;             // ISO timestamp of the fetch
  providers: NexusProvider[];
};
```

### Step 1.2 — `nexusProviderRegistry.ts`

A single static TypeScript file that exports only the **provider metadata** — no models:

```ts
export const nexusProviderRegistry: NexusProviderDefinition[] = [
  {
    id: "minimax",
    name: "MiniMax (minimax.io)",
    baseUrl: "https://api.minimax.io/anthropic",
    npm: "@ai-sdk/anthropic",
    api: "anthropic-messages",
    authType: "api_key",
  },
  {
    id: "minimax-cn",
    name: "MiniMax China (minimaxi.com)",
    baseUrl: "https://api.minimaxi.com/anthropic",
    npm: "@ai-sdk/anthropic",
    api: "anthropic-messages",
    authType: "api_key",
  },
  // ... other providers
];
```

This file is hand-maintained. When a **new provider** appears, we add it here. When a **new model** ships, we do **nothing** — the next `/model` invocation fetches it automatically. The provider list is the only hardcoded part.

### Step 1.3 — `nexusModelCatalogFetcher.ts`

Fetches the live model catalog at `/model` time:

```ts
async function fetchNexusModelCatalog(
  registry: NexusProviderDefinition[],
  opts?: { signal?: AbortSignal },
): Promise<NexusModelCatalog>
```

1. Fetches `https://models.dev/api.json` (or the configured endpoint).
2. Parses the response into provider → models map.
3. Filters to providers that exist in `nexusProviderRegistry`.
4. Maps each model into `NexusModel` shape.
5. Returns `{ version: 1, fetchedAt: new Date().toISOString(), providers: [...] }`.

Errors are **per-provider** — if one provider's models fail to parse, we skip that provider and include the rest. A total network failure returns an empty catalog (the picker shows an error state with a retry option).

### Step 1.4 — `nexusModelCatalogStore.ts`

Async in-memory store with subscribers:

```ts
type StoreState =
  | { status: "empty" }                         // never loaded
  | { status: "loading" }                       // fetch in progress
  | { status: "ready"; catalog: NexusModelCatalog }
  | { status: "error"; error: Error };

subscribe(listener): () => void  // returns unsubscribe
getState(): StoreState
load(): Promise<NexusModelCatalog>  // async — triggers fetch
```

`load()` is called by the picker every time `/model` is invoked, and once silently at extension boot. It triggers `fetchNexusModelCatalog`, updates the store state (`loading` → `ready`/`error`), and notifies subscribers. Multiple rapid calls dedupe to a single in-flight fetch.

A disk cache (`~/.local/share/nexus/agent/model-catalog.json`) stores the last successful fetch. On boot, the store is primed from disk if the network is unavailable, so Pi always has a model list to work with. The picker still triggers a live fetch when opened, ensuring the user always sees the latest data when actively choosing a model.

### Step 1.5 — `injectNexusCatalogIntoPi.ts`

Bridges the **fetched** Nexus catalog → Pi's `ModelRegistry`. Called after `load()` resolves successfully.

```ts
function injectNexusCatalogIntoPi(pi: ExtensionAPI, catalog: NexusModelCatalog): void {
  for (const provider of catalog.providers) {
    pi.registerProvider(provider.id, {
      baseUrl: provider.baseUrl,
      api: provider.api as Api,
      apiKey: getDefaultApiKeyForProvider(provider),
      models: provider.models.map(toPiProviderModelConfig),
    });
  }
}
```

For Nexus-aliased providers (`minimax-code` → `minimax`), we register **both**: the canonical id AND the Nexus alias. The alias uses the same fetched models.

This is called **after every successful fetch** and **after every auth change** (add/update/remove credential) — so Pi's runtime always has the freshest model list and the latest API keys available.

---

## Phase 2: Nexus-owned auth

### Step 2.1 — `NexusAuthStorage`

```ts
type NexusAuthEntry =
  | { type: "api_key"; key: string; label?: string }
  | { type: "oauth"; access: string; refresh: string; expires: number; label?: string };

class NexusAuthStorage {
  static open(path?: string): Promise<NexusAuthStorage>  // reads from disk
  get(providerId: string): NexusAuthEntry | undefined
  set(providerId: string, entry: NexusAuthEntry): void   // writes to disk + notifies
  remove(providerId: string): void
  list(): string[]                                        // provider ids with auth
  has(providerId: string): boolean
  subscribe(listener: () => void): () => void             // for picker live updates
  close(): void                                           // flush + close file handle
}
```

- File: `~/.local/share/nexus/agent/auth.json`
- File format: `Record<providerId, NexusAuthEntry>` (matches the existing `readNexusAuth` shape, so `slashusage` doesn't need to change)
- Writes are atomic (write to `.tmp`, rename). No file locking yet (single-process).

### Step 2.2 — No automatic migration

Nexus does **not** read `~/.pi/agent/auth.json` on first boot. Users who want to bring auth from Pi use the existing `/login` → "Import from Pi" slash-menu flow.

The import flow is already implemented in `packages/pi-platform/src/login-import/` and `packages/extension-core/src/slash-menu/createLoginImportLeaves.ts`. After this refactor, the import path should write to `NexusAuthStorage` (which then mirrors to Pi via the bridge), rather than writing directly to Pi's `authStorage`.

### Step 2.3 — `nexusAuthBridge.ts`

Read-through from Pi's `authStorage` into Nexus. Two strategies:

- **Option A (chosen):** Pi's `authStorage` is a thin wrapper that reads from `NexusAuthStorage`. When Pi calls `authStorage.set(providerId, credential)`, it writes to `~/.local/share/nexus/agent/auth.json` via `NexusAuthStorage`. When Pi calls `authStorage.get(providerId)`, it reads from `NexusAuthStorage`.
- **No write-through from Nexus to Pi** — we never call `ctx.modelRegistry.authStorage.set(...)` from Nexus. Pi's runtime reads auth from the same file Nexus owns.

This is implemented by replacing Pi's internal `authStorage` instance with a `NexusAuthStorage`-backed adapter at extension setup time, or by patching the auth resolution path so Pi reads from Nexus first.

For the OAuth providers that Pi handles natively (anthropic, copilot, codex, etc.), the OAuth flow still executes inside Pi's code, but the resulting credential is written to `NexusAuthStorage` instead of Pi's internal auth store. Pi then reads it back from Nexus for subsequent requests.

### Step 2.4 — `nexusAuthResolve.ts`

The priority chain for resolving a credential at request time:

```ts
async function resolveNexusAuth(
  providerId: string,
  opts: {
    nexus: NexusAuthStorage;
    runtimeOverrides?: Map<string, string>;  // from --api-key CLI flag
  },
): Promise<string | undefined>
```

Priority:
1. Runtime override (`--api-key` for `providerId`).
2. Nexus auth file (`nexus.get(providerId)`).
3. `undefined` (caller shows "not authenticated").

This replaces the inline resolution in `getMinimaxToken.ts:9-19` (and similar in `getZaiApiKey.ts`, `getCodexCredentials.ts`, etc.). Each of those becomes a thin wrapper around `resolveNexusAuth`.

---

## Phase 3: Replace the `/model` picker (both tabs)

### Step 3.1 — Two tabs, one source

The `/model` picker has two tabs that today are fed by two different code paths:

| Tab                | Today                                                                    | After                          |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------ |
| "Models"           | `createAvailableModelLeaves(ctx)` → `ctx.modelRegistry.getAvailable()`        | `createNexusModelPickerLeaves(ctx, { mode: "authenticated" })` |
| "All models"       | `createModelCatalogLeaves()` → `getProviders()` + `getModels(p)` from `pi-ai` | `createNexusModelPickerLeaves(ctx, { mode: "all" })`            |

Both tabs end up reading from the same `NexusModelCatalogStore`. The difference is the filter:
- "Models" → `catalog.providers.flatMap(p => p.models)` filtered to `auth.list().has(p.id)`
- "All models" → `catalog.providers.flatMap(p => p.models)` (no auth filter, every model from every provider, including ones the user hasn't logged into)

This collapses the current two-source architecture into a single one-source architecture. Because the catalog is fetched at `/model` time, `MiniMax-M3` (and every other newly-released model) appears in the picker as soon as it ships — no waiting for Pi releases, no static file updates.

### Step 3.2 — `createNexusModelPickerLeaves.ts`

```ts
type NexusModelPickerMode = "authenticated" | "all";

function createNexusModelPickerLeaves(ctx: {
  store: NexusModelCatalogStore;
  auth: NexusAuthStorage;
  mode: NexusModelPickerMode;
}): NexusModelPickerLeaf[]
```

1. Read `store.getState()`.
2. If `status !== "ready"`, return a single placeholder leaf (loading spinner or error message).
3. If `status === "ready"`, start with `catalog.providers.flatMap(p => p.models)`.
4. If `mode === "authenticated"`, filter to models whose `provider` is in `auth.list()`.
5. Sort: by provider, then by name.
6. Format each as a leaf with id, label, description, status (✓ configured, etc.).

This replaces **both** `createAvailableModelLeaves` and `createModelCatalogLeaves`.

### Step 3.3 — `NexusModelPickerModal.ts`

A new modal component (uses the same `pi-tui` primitives as Pi's `OAuthSelectorComponent`):

- **Triggers fetch on open** — calls `store.load()` when the modal opens. This initiates the network fetch.
- **Loading state** — while `store.getState().status === "loading"`, shows a spinner with "Fetching models…".
- **Error state** — if `status === "error"`, shows the error message and a **Retry** button that calls `store.load()` again.
- **Search box** at the top (only when `status === "ready"`).
- **Tab header** (Models / All models) — same UX as today, but both tabs are Nexus-sourced.
- **List of models** from `createNexusModelPickerLeaves(ctx, { mode: <tab> })`.
- **Status indicator** per row: ✓ configured, etc. (mirrors the logic in `OAuthSelectorComponent.formatStatusIndicator`).
- **Detail pane** (optional, shows on focus): context, max tokens, cost breakdown, release date.
- **Enter** → calls `pi.setModel(model)` and closes.
- **Esc** → closes without changes.

### Step 3.4 — `createModelMenuLeaves.ts` dispatch

The current dispatcher:

```ts
export function createModelMenuLeaves(ctx: ExtensionContext, tab: ModelMenuTab): SlashMenuLeaf[] {
  return tab === "models" ? createAvailableModelLeaves(ctx) : createModelCatalogLeaves();
}
```

becomes:

```ts
export function createModelMenuLeaves(ctx: NexusExtensionContext, tab: ModelMenuTab): SlashMenuLeaf[] {
  return createNexusModelPickerLeaves(ctx, { mode: tab === "models" ? "authenticated" : "all" });
}
```

Note: `ctx` now needs to expose `store` (the async Nexus catalog store) and `auth` (the Nexus auth storage), in addition to the regular `ExtensionContext` fields. The `NexusExtensionContext` type wraps `ExtensionContext` with these extra fields and is constructed once at extension setup.

### Step 3.5 — Replace the `/model` slash command

The current `/model` slash command in `SlashMenuModal.ts:openLevel("model")` opens Pi's picker. We replace it with the new `NexusModelPickerModal`.

I'll go with: replace `/model` outright. The picker is a strict improvement (more models, fresh data, both tabs read from the same source). If we discover a regression, we can add a feature flag in a hotfix — the flag isn't worth the upfront complexity.

### Step 3.6 — Selection flow

When the user picks a model in the Nexus picker:

1. Look up the model in the Nexus catalog.
2. Translate it to a Pi `Model<Api>` object (same shape as `ProviderModelConfig`).
3. Call `ctx.pi.setModel(model)`.
4. Notify "Selected MiniMax-M3 (minimax-code)".

---

## Phase 4: Extension entrypoint setup

### Step 4.1 — On first boot after upgrade

In the extension entrypoint (`registerAiProvidersExtension.ts` or a new `registerNexusAuthExtension.ts`):

1. Open `NexusAuthStorage` (creates the file if missing).
2. Subscribe the auth-bridge to Nexus auth changes.
3. **Silent boot-time fetch** — trigger one background fetch of the catalog on extension setup and inject it into Pi immediately. This ensures Pi's `ModelRegistry` is populated from the first session even if the user never opens `/model`. The `/model` picker still triggers its own fresh fetch when opened, so the picker always shows live data.
4. **Auth-change reinjection** — subscribe `NexusAuthStorage` to credential changes. Whenever any credential is added, updated, or removed, re-run `injectNexusCatalogIntoPi` so Pi always holds the latest API keys without requiring the user to reopen `/model`.
5. Register provider skeletons (id, baseUrl, api, authType) with Pi so that `/login` and auth flows work before the first `/model` fetch.

### Step 4.2 — Disk cache for catalog

`nexusModelCatalogStore.ts` persists the last successful catalog to `~/.local/share/nexus/agent/model-catalog.json` on every fetch. On extension boot, the store reads this file first, then triggers a silent background fetch to refresh it. This ensures Pi is never left with an empty catalog even if the network is down at startup.

### Step 4.3 — Pre-existing `readNexusAuth.ts` callers

`readNexusAuth` is currently used by `getMinimaxToken.ts`, `getZaiApiKey.ts`, `getCodexCredentials.ts`, etc. These should be updated to use `NexusAuthStorage` directly (or the new `resolveNexusAuth` function). The function signature stays compatible (returns `Record<string, unknown> | undefined`), but the implementation reads from the same file the new auth storage writes to.

This means we don't need to migrate `readNexusAuth.ts`'s callers — they already work, as long as `~/.local/share/nexus/agent/auth.json` has the data (populated via `/login` or the import flow).

---

## Phase 5: `/login` flow update

Once Nexus owns auth, the `/login` flow needs to write to Nexus, not Pi.

### Step 5.1 — Update `createManualOAuthProvider.ts`

The current `createManualOAuthProvider` writes to Pi's `authStorage` (via the OAuth flow). After the refactor, all login flows — both OAuth and API key — must write credentials into `NexusAuthStorage` so that `~/.local/share/nexus/agent/auth.json` remains the single source of truth.

For API-key providers:

```ts
class NexusManualApiKeyProvider {
  async login(callbacks: { onPrompt: ... }): Promise<NexusAuthEntry> {
    const key = await callbacks.onPrompt({ message: "Enter API key:" });
    return { type: "api_key", key };
  }
  // refreshToken, getApiKey, etc. become no-ops for api_key type
}
```

For the five Pi-native OAuth providers (`anthropic`, `github-copilot`, `openai-codex`, `google-gemini-cli`, `google-antigravity`), Pi continues to execute its built-in browser-based OAuth flow and writes the resulting credential directly into `NexusAuthStorage` (i.e. `~/.local/share/nexus/agent/auth.json`) at the end of the flow. Pi's runtime then reads the credential back from `NexusAuthStorage` via the read-through adapter. This is an accepted exception — Nexus does not reimplement those browser flows; Pi still drives them. For all other OAuth providers, the OAuth flow is fully managed by Nexus via `createManualOAuthProvider` (the same manual-OAuth pattern already used by the oh-my-pi/omp reference) and writes to `NexusAuthStorage` directly. There is no separate Pi auth store; Pi reads from the same file Nexus owns.

### Step 5.2 — Update `applyLoginImportPatch.ts`

The top-level `/login` menu currently shows:
- Import from Pi
- Import from OpenCode
- Use a subscription
- Use an API key

We collapse the last two into one "Configure a provider" action, and the auth-type filter is internal (the picker shows all providers, and each provider's auth type determines the login flow). This was already the user's preference.

---

## File-by-file change list

### New files

```
packages/extension-core/src/ai-providers/
├── model-catalog/
│   ├── NexusModelCatalog.ts
│   ├── nexusProviderRegistry.ts              # hardcoded provider metadata (id, authType, baseUrl, api) — NO models
│   ├── nexusModelCatalogFetcher.ts           # fetches models from models.dev/api.json at runtime
│   ├── nexusModelCatalogStore.ts
│   ├── listNexusAuthProviders.ts
│   └── injectNexusCatalogIntoPi.ts
├── auth/
│   ├── NexusAuthStorage.ts
│   ├── nexusAuthBridge.ts
│   └── nexusAuthResolve.ts

packages/extension-core/src/slash-menu/
├── model-catalog/
│   ├── NexusModelPickerModal.ts
│   ├── createNexusModelPickerLeaves.ts       # replaces BOTH createAvailableModelLeaves and createModelCatalogLeaves
│   └── formatNexusModelRow.ts

```

### Modified files

```
packages/extension-core/src/ai-providers/
├── model/AiProviderDefinition.ts              # adds authType: "oauth" | "api_key"
├── model/ohMyPiProviderDefinitions.ts         # adds authType to every provider entry
├── register/registerOhMyPiProvider.ts         # branches on authType; API-key providers skip oauth field
└── register/registerAiProvidersExtension.ts  # sets up auth bridge; registers provider skeletons; lazy fetch on /model

packages/extension-core/src/slash-menu/
├── SlashMenuModal.ts                          # /model routes to Nexus picker
├── model-catalog/createModelMenuLeaves.ts     # dispatch updated to use createNexusModelPickerLeaves
├── model-catalog/createModelCatalogLeaves.ts  # DELETED (replaced by createNexusModelPickerLeaves with mode: "all")
├── model-catalog/createAvailableModelLeaves.ts # DELETED (replaced by createNexusModelPickerLeaves with mode: "authenticated")
├── createLoginProviderLeaves.ts               # uses Nexus auth for "configured" detection
├── createLogoutProviderLeaves.ts              # reads from Nexus auth
└── internal-commands/showOAuthLoginDialog.ts  # writes to Nexus auth (via bridge)

packages/pi-platform/src/login-import/
├── patch/applyLoginImportPatch.ts             # collapse "Use subscription" + "Use API key" into one action
└── ui/createLoginActionGroups.ts              # same

packages/extension-core/src/ai-providers/oauth/
└── createManualOAuthProvider.ts               # returns api_key-shaped entries; writes via bridge

packages/extension-core/src/slashusage/
└── (each provider's getXxxToken.ts)           # uses resolveNexusAuth instead of readNexusAuth
```

### Tests (new)

```
test/extensions/ai-providers/model-catalog/
├── nexusModelCatalogFetcher.test.ts
├── nexusModelCatalogStore.test.ts
└── injectNexusCatalogIntoPi.test.ts

test/extensions/ai-providers/auth/
├── NexusAuthStorage.test.ts
├── nexusAuthBridge.test.ts
└── nexusAuthResolve.test.ts

test/extensions/ai-providers/
└── registerAiProvidersExtension.test.ts       # updated for new flow

test/extensions/slash-menu/model-catalog/
├── NexusModelPickerModal.test.ts
├── createNexusModelPickerLeaves.test.ts      # covers BOTH "authenticated" and "all" modes
└── formatNexusModelRow.test.ts

test/extensions/slash-menu/
├── createLoginProviderLeaves.test.ts          # updated
└── createLogoutProviderLeaves.test.ts         # updated
```

---

## Phased delivery (today)

I would suggest rolling this out in two PRs:

### PR 1 — Auth + model catalog plumbing (no UI changes)

- Add `NexusAuthStorage`, `nexusAuthBridge`, `resolveNexusAuth`.
- Add `NexusModelCatalog` types, `nexusProviderRegistry.ts` (hardcoded provider list), `nexusModelCatalogFetcher.ts` (runtime fetch), `nexusModelCatalogStore.ts` (async store), `injectNexusCatalogIntoPi`.
- Update `AiProviderDefinition` and `ohMyPiProviderDefinitions.ts` to add `authType`.
- Update `registerOhMyPiProvider.ts` to branch on `authType`.
- Wire `registerAiProvidersExtension` to:
  - Open `NexusAuthStorage`.
  - Subscribe auth-bridge.
  - Register provider skeletons with Pi (so `/login` works before first `/model`).
  - **Do NOT fetch models on boot** — lazy fetch happens on `/model`.
- All tests pass; the old Pi picker still works (we haven't replaced it yet, just re-populated it with fresh data).

This PR unblocks M3 (fetched live on `/model`) and fixes the auth categorization (no more `createManualOAuthProvider` for API-key providers).

### PR 2 — Replace `/model` picker

- Add `NexusModelPickerModal`, `createNexusModelPickerLeaves`, `formatNexusModelRow`.
- Replace `SlashMenuModal.openLevel("model")` to use the new picker.
- Collapse `/login` "Use subscription" + "Use API key" into one action.

After this PR, the user sees the new picker.

---

## Open questions (still TBD)

1. **Pre-existing `ohMyPiProviderDefinitions.ts`**: do we keep this list, or does the catalog now drive the provider list entirely? I assume we keep the alias map (Nexus's `minimax-code` → catalog's `minimax`) and drop the manual model injection.
2. **Cursor's live model discovery**: do we route the live fetch through Nexus auth, or keep it Pi-native? Probably keep Pi-native; it's already special.
3. **The 5 Pi-native OAuth providers (anthropic, copilot, codex, gemini-cli, antigravity)**: these retain their Pi-native browser OAuth flow as an accepted exception. Pi executes the flow and writes the resulting credential into `NexusAuthStorage`. Every other OAuth provider is fully managed by Nexus via a unified `createManualOAuthProvider` path. This is the only Pi-native exception in the auth layer.
4. **Auth-import flows (`/login` → "Import from Pi" / "Import from OpenCode")**: today they call `pi.authStorage.set`. After the refactor, they should call `nexusAuth.set` (which mirrors to Pi). The import data shape may need to translate.
5. **Provider registry update cadence**: how do we know when to add a new provider to `nexusProviderRegistry.ts`? A periodic manual check against `models.dev` or `omp.sh/docs/providers` is enough. New models are automatic (fetched at runtime), so only new providers require a code change.
6. **Picker keyboard shortcuts**: do we add any beyond search/select? Pi's picker has a "tabs" feature (Models / All models). We may not need that for Nexus (since we only show available).

---

## What this plan does NOT do

- No changes to `feature-flags.json` (the new picker is the default; the old picker is dropped).
- No changes to branding, self-launch paths, mini-apps, or the existing usage/quota extension.
- No changes to the bundled `@earendil-works/pi-ai` dependency (we still use it; we just don't depend on its bundled model list).
- No automatic migration of `~/.pi/agent/auth.json` on first boot. Users who want to import existing Pi auth use the existing `/login` → "Import from Pi" slash-menu flow, which writes imported credentials into `NexusAuthStorage`.

---

## Auth-type classification (hard-coded)

Every provider in `ohMyPiProviderDefinitions.ts` gets an explicit `authType`:

```ts
export interface AiProviderDefinition {
  id: string;
  name: string;
  credentialLabel: string;
  authType: "oauth" | "api_key";
}
```

Classification of the current 39 providers:

**Pi-native OAuth (`authType: "oauth"`)** — Pi executes the built-in browser flow; credential lands in `NexusAuthStorage`:
- `anthropic` — Pi-native OAuth access token
- `openai-codex` — Pi-native OAuth access token
- `github-copilot` — Pi-native OAuth access token
- `google-gemini-cli` — Pi-native OAuth access token
- `google-antigravity` — Pi-native OAuth access token

**Nexus-managed OAuth (`authType: "oauth"`)** — Nexus runs the flow via `createManualOAuthProvider`; credential lands in `NexusAuthStorage`:
- `gitlab-duo` — Nexus-managed OAuth access token
- `kimi-code` — Nexus-managed OAuth access token
- `qwen-portal` — OAuth token or API key (classified as oauth because it supports OAuth; managed by Nexus)

**API key (`authType: "api_key"`)** — single prompt, stored as `{ type: "api_key", key }`:
- `alibaba-coding-plan`
- `kilo`
- `kagi`
- `cerebras`
- `fireworks`
- `cursor` — Cursor access token (pasted token, treated as API key)
- `litellm`
- `lm-studio`
- `ollama`
- `ollama-cloud`
- `huggingface`
- `synthetic`
- `tavily`
- `together`
- `xiaomi`
- `opencode-zen`
- `opencode-go`
- `zai`
- `minimax-code`
- `minimax-code-cn`
- `moonshot`
- `nanogpt`
- `parallel`
- `perplexity`
- `nvidia`
- `qianfan`
- `venice`
- `zenmux`
- `vllm`
- `cloudflare-ai-gateway`
- `vercel-ai-gateway`

`registerOhMyPiProvider.ts` branches on `authType`:
- `api_key` → registers with `pi.registerProvider(id, { models, baseUrl, api, apiKey })` **without** an `oauth` field. The API key is resolved at request time from `NexusAuthStorage` via `resolveNexusAuth`. Pi's `isApiKeyLoginProvider` then correctly returns `true`.
- `oauth` → registers with `pi.registerProvider(id, { models, baseUrl, api, oauth: createManualOAuthProvider(definition) })`. The OAuth flow implementation writes the resulting credential to `NexusAuthStorage`, and Pi reads it back from there.

This removes the ambiguity where Pi's heuristics mis-classify Nexus providers, and ensures all credentials live in the Nexus auth file.

---

## Verification

End-to-end:

1. `just dev` → opens with provider skeletons registered and catalog injected from disk cache or silent boot-time fetch.
2. Type `/login` → see "Configure a provider" → pick `minimax-code` → enter API key → stored in `~/.local/share/nexus/agent/auth.json` → Pi's runtime receives the updated key immediately via auth-change reinjection.
3. Type `/model` → picker shows "Fetching models…" spinner, then displays `minimax-code` models including `MiniMax-M3` (fetched live). Pick one → `pi.setModel(...)` switches the runtime. If the network is down, the picker falls back to the last cached catalog from disk.
4. Tab to **All models** in the picker → search for "minimax" → see all `minimax` and `minimax-cn` models from the live fetch, including `MiniMax-M3`, `MiniMax-M2.7`, `MiniMax-M2.7-highspeed`, etc. This is the tab that was previously missing M3.
5. Disconnect from the network → type `/model` → picker shows error state with **Retry** button.
6. Type `/logout` → `minimax-code` is removed from Nexus auth AND from Pi's authStorage.
7. Verify the existing usage extension (`packages/extension-core/src/slashusage/`) still resolves tokens for the providers it tracks (because `readNexusAuth` and `resolveNexusAuth` read from the same file).
