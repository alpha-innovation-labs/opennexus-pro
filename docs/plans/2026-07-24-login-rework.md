# Plan: `/login` rework — two-pane provider-model picker

## Background

The current `/login` flow (levels `"login"` and `"login-providers"`) renders a single list from `createLoginProviderLeaves()`: a "Local Providers" header followed by available models from `ctx.modelRegistry.getAvailable()`. It is a single-pane, read-only list — no provider toggling, no model filtering, no persistence.

This plan redesigns `/login` into a **two-pane modal** mirroring the SlashMenuModal's left/right pane architecture:

- **Left pane**: list of all registered providers (from the Nexus provider registry).
- **Right pane**: models for the currently focused/selected provider.

## Scope

1. **Left pane = provider list.** The title "Local Providers" stays, but the list items are providers (not models).
2. **Provider selection changes the right pane.** Selecting a provider populates the right pane with that provider's models.
3. **Toggle per provider.** Each provider row has an inline toggle (activated by pressing Enter on the provider row). A toggled (enabled) provider is colored green; an untoggled (disabled) provider uses the default color.
4. **Provider states persist.** Toggle state is saved to `~/.config/nexus/config.json` under a new top-level key `providers`.
5. **Tab switches focus** between left and right panes.
6. **jk navigation works in both panes** — jk moves up/down in whichever pane has focus.
7. **Type-anywhere filtering.** As the user types (in the bottom search bar), both the provider list and the model list are filtered. If a model exists on multiple providers, it appears under each matching provider; providers that don't match the query are hidden. The filter applies to both provider names and model names.
8. **Model selection sets the default.** Selecting a model on the right pane calls `pi.setModel(...)` and closes the modal — identical to the existing `/model` flow.

## Existing architecture references

- **`SlashMenuLevel`** (`packages/extension-core/src/slash-menu/SlashMenuLevel.ts`): currently has `"login"` and `"login-providers"`. We add a new level `"login-picker"`.
- **`SlashMenuModal`** (`packages/extension-core/src/slash-menu/SlashMenuModal.ts`): extends `SelectPreviewModal` which already supports two-pane rendering (`activePane: "left" | "right"`). The login modal reuses this base class.
- **`createLoginProviderLeaves`** (`packages/extension-core/src/slash-menu/createLoginProviderLeaves.ts`): currently returns a single list. Replaced by a new modal component.
- **`filterMenuItems`** (`packages/extension-core/src/slash-menu/filterMenuItems.ts`): scoring + query matching. We reuse this for filtering both provider and model lists.
- **`handleInternalLoginCommand`** (`packages/extension-core/src/slash-menu/internal-commands/handleInternalLoginCommand.ts`): currently a stub ("hello world"). Replaced by the picker modal.
- **`NexusUserConfig`** (`packages/nexus-runtime/src/config/types.ts`): add `providers?: Record<string, { enabled: boolean }>` to the type.
- **`readNexusUserConfig` / `writeNexusUserConfig`**: used to read/write provider toggle states.
- **`SlashMenuModal.openLevel("login")`** (line 478): routes to `resolveRequestedSlashMenuLevel(ctx, level)` which returns `"login"`. We change this to route to `"login-picker"` instead.
- **`SlashMenuModal.handleEnter()`** (line 389): currently routes `"login"` and `"login-providers"` to `/nexus-login-select ${item.value}`. We replace this with a picker-specific handler.

## Config schema

```ts
type NexusUserConfig = {
  // ... existing fields ...
  providers?: Record<string, { enabled: boolean }>;
};
```

- Key is the provider id (e.g. `"minimax"`, `"anthropic"`).
- Value is `{ enabled: boolean }` — `true` means the provider is toggled on (green), `false` means off (default color).

## Module layout

```
packages/extension-core/src/slash-menu/
├── login-picker/
│   ├── LoginPickerModal.ts          # new: two-pane modal component
│   ├── createLoginProviderList.ts    # builds left-pane provider items
│   ├── createLoginModelList.ts       # builds right-pane model items (filtered by selected provider)
│   ├── toggleProviderEnabled.ts      # reads/writes config.json under `providers` key
│   ├── filterLoginItems.ts           # query-based filtering for both panes
│   └── resolveProviderModels.ts      # fetches models for a single provider from the catalog
```

## Detailed design

### Step 1 — Config schema extension

Extend `NexusUserConfig` in `packages/nexus-runtime/src/config/types.ts` with:

```ts
providers?: Record<string, { enabled: boolean }>;
```

This is persisted via the existing `readNexusUserConfig()` / `writeNexusUserConfig()` helpers. No new file — it lives in `~/.config/nexus/config.json` alongside `featureFlags`, `miniApps`, etc.

### Step 2 — `LoginPickerModal` component

A new class extending `SelectPreviewModal` (same base as `SlashMenuModal`).

**State:**
- `activePane: "left" | "right"` (inherited from `SelectPreviewModal`).
- `selectedProviderId: string | null` — the currently selected provider on the left.
- `query: string` — the bottom search bar text.
- `providerStates: Record<string, { enabled: boolean }>` — loaded from config on open, mutated on toggle.

**Lifecycle:**
1. On open: load provider states from `readNexusUserConfig().providers ?? {}`.
2. Fetch the live model catalog (from `nexusModelCatalogStore`, as established in the existing auth+catalog plan).
3. Render left pane: list of all providers, each showing name + green/gray toggle indicator.
4. Render right pane: models for the first (or previously selected) provider.
5. On close: write `providerStates` back to config via `writeNexusUserConfig()`.

**Rendering:**
- Left pane title: "Providers" (replaces "Local Providers").
- Each provider row: `[●] ProviderName` (green dot when enabled, gray when disabled).
- Right pane title: the selected provider's name.
- Right pane: list of models for that provider.

**Color coding:**
- When a provider is `enabled: true`, its row text is rendered in green (using the theme's green color).
- When `enabled: false` or absent, it uses the default (gray/white) color.

### Step 3 — Provider list (`createLoginProviderList.ts`)

Returns an array of `SlashMenuLeaf` (or `AutocompleteItem`) entries, one per provider from `nexusProviderRegistry`:

```ts
type ProviderLeaf = {
  kind: "provider";
  label: string;           // provider name
  value: string;           // provider id
  groupLabel?: undefined;  // no grouping
  enabled: boolean;        // from config
};
```

Each leaf is rendered with a green/gray indicator based on the `enabled` flag.

### Step 4 — Model list (`createLoginModelList.ts`)

Given a `providerId`, returns model leaves for the right pane:

```ts
function createLoginModelList(
  providerId: string,
  catalog: NexusModelCatalog,
  query: string,
): SlashMenuLeaf[];
```

Filters models by the query (reusing `filterMenuItems`), and only includes models from the specified provider. If `providerId` is null/empty, shows nothing.

### Step 5 — Toggle logic (`toggleProviderEnabled.ts`)

```ts
function toggleProviderEnabled(
  providerId: string,
  currentStates: Record<string, { enabled: boolean }>,
): { states: Record<string, { enabled: boolean }>; nextEnabled: boolean };
```

Flips the enabled state, then calls `writeNexusUserConfig()` to persist. The config write is done **on every toggle** (not deferred), so the state is durable across sessions.

### Step 6 — Query filtering (`filterLoginItems.ts`)

When the user types in the bottom search bar:

1. Tokenize the query (reuse `createSearchTokens` from `filterMenuItems`).
2. **Provider filtering**: hide providers whose name/id does not match the query.
3. **Model filtering**: for each visible provider, filter its models by the query.
4. If a model appears under multiple providers, it appears under each matching provider.
5. Providers with zero matching models after filtering are hidden from the left pane.

This is a two-pass filter: first filter providers, then for each visible provider, filter its models.

### Step 7 — Interaction model

**Keyboard:**
- **Enter on a provider row**: toggles that provider's enabled state (green ↔ gray). If the provider was previously selected, the right pane updates to show its models.
- **Enter on a model row**: selects the model (calls `pi.setModel(...)`) and closes the modal.
- **Tab**: switches focus between left pane (providers) and right pane (models). Cycles: left → right → left.
- **j/k**: moves selection up/down within the currently focused pane.
- **Type text**: updates the query, re-filters both panes. The selection resets to the first item in the focused pane.
- **Escape**: closes the modal without saving (or saves if partial changes were made — either is acceptable; saving is simpler).

**Mouse (if supported):**
- Click a provider row: selects it (right pane updates).
- Click the toggle indicator: toggles enabled state.
- Click a model row: selects it and closes.

### Step 8 — Routing update

In `SlashMenuModal`:

1. Add `"login-picker"` to `SlashMenuLevel` type.
2. In `openLevel("login")`, route to `"login-picker"` instead of `"login"`.
3. In `handleEnter()`, add a case for `"login-picker"` that:
   - If focused on a provider: toggle it.
   - If focused on a model: dispatch `/nexus-model-select ${providerId}/${modelId}` (same as the existing `/model` selection).
4. In `createActiveLeaves()`, remove the `"login"` and `"login-providers"` cases — they are replaced by the modal.
5. In `refresh()`: when `level === "login-picker"`, instantiate `LoginPickerModal`, set up the two-pane rendering, and call `requestRender()`.

### Step 9 — Model catalog integration

The `LoginPickerModal` reads from the same `nexusModelCatalogStore` that the `/model` picker uses (as established in the existing auth+catalog plan). When the modal opens, it triggers a catalog fetch (`store.load()`). If the catalog is not yet loaded, the right pane shows a loading state. The left pane (providers) is static — it comes from the hardcoded registry.

### Step 10 — Integration with existing auth

When a provider is toggled on (enabled = true), the picker should show that provider's models in the right pane. When toggled off, the provider is grayed out and its models are hidden (unless the user searches for a model name that matches — in which case the provider reappears to show the matching model).

The model selection flow (`pi.setModel(...)`) is identical to the existing `/model` flow: it calls `pi.setModel(model)`, sets the promptline override, and notifies the user.

## File-by-file changes

### New files

```
packages/extension-core/src/slash-menu/
├── login-picker/
│   ├── LoginPickerModal.ts
│   ├── createLoginProviderList.ts
│   ├── createLoginModelList.ts
│   ├── toggleProviderEnabled.ts
│   ├── filterLoginItems.ts
│   └── resolveProviderModels.ts
```

### Modified files

```
packages/nexus-runtime/src/config/types.ts
  → add `providers?: Record<string, { enabled: boolean }>`

packages/extension-core/src/slash-menu/
├── SlashMenuLevel.ts
│   → add "login-picker" to the union type

├── SlashMenuModal.ts
│   → openLevel("login") routes to "login-picker"
│   → handleEnter: new case for "login-picker"
│   → refresh: new case for "login-picker" (instantiates LoginPickerModal)
│   → remove "login" and "login-providers" from setFullScreenMode
│   → remove "login" and "login-providers" from shouldShowSlashMenuPreview

├── createActiveLeaves.ts
│   → remove "login" and "login-providers" cases

├── createLoginProviderLeaves.ts
│   → DELETED (replaced by LoginPickerModal)

├── internal-commands/
│   ├── registerInternalSlashSelectorCommands.ts
│   │   → remove "nexus-login-select" registration (or keep as no-op)
│   └── handleInternalLoginCommand.ts
│       → DELETED (replaced by modal)

├── getSlashMenuLevelTitle.ts
│   → remove "login" and "login-providers" cases

├── getSlashMenuItemIcon.ts
│   → remove "login" and "login-providers" cases

├── resolveRequestedSlashMenuLevel.ts
│   → no change needed (login→login-picker is a direct route)
```

## Phased delivery

### Phase 1 — Config + provider list (no models yet)

- Extend `NexusUserConfig` with `providers` key.
- Create `toggleProviderEnabled.ts` (read/write to config).
- Create `createLoginProviderList.ts` (static provider list from registry).
- Wire up the left pane in `LoginPickerModal`.
- Routing: `openLevel("login")` → `"login-picker"` → shows left pane only.
- Enter toggles provider; toggle persists to config.
- No right pane yet (shows "Select a provider").

### Phase 2 — Right pane + model catalog

- Integrate `nexusModelCatalogStore` into `LoginPickerModal`.
- Create `createLoginModelList.ts` and `resolveProviderModels.ts`.
- Right pane shows models for the selected provider.
- Tab switches focus between panes.
- jk navigation works in both panes.

### Phase 3 — Search + model selection

- Create `filterLoginItems.ts` (two-pass filter: providers then models).
- Bottom search bar filters both panes simultaneously.
- Model selection calls `pi.setModel(...)` and closes.
- Remove old `createLoginProviderLeaves.ts`, `handleInternalLoginCommand.ts`.
- Update all routing references.

## Open questions

1. **What happens when a toggled-off provider has models that match the search query?** The provider reappears in the left pane (grayed) and its matching models appear on the right. This lets users find models even from disabled providers, but selecting them would use the model without enabling the provider. This is acceptable — the model selection is the user's intent.

2. **Should the right pane auto-update when a provider is toggled on?** Yes — toggling a provider on (green) should immediately populate the right pane with that provider's models, even if the user doesn't explicitly select it. This is the expected UX: enabling a provider = seeing what's available.

3. **How to handle the case where no providers are toggled on?** The right pane shows "No providers enabled. Toggle a provider to see models." The user can still search and find models from any provider (even disabled ones), but selecting one from a disabled provider would work — it just won't persist the enablement.

4. **Should toggling a provider also update Pi's runtime immediately (auth-change reinjection)?** Yes — when a provider is toggled on, if it has auth, the existing `injectNexusCatalogIntoPi` flow should re-inject models for that provider into Pi's `ModelRegistry`. This is already handled by the existing auth+catalog plan's auth-change subscription.

5. **E2e test snapshots capture the raw TUI terminal rendering (ASCII art), not structured data.** The `read` command returns the full terminal screen as text — including box-drawing characters, color escape codes (if any), and layout. Tests must parse or grep this raw output for expected strings (e.g., `Providers`, model names, `●` indicators). Color assertions rely on visual markers (e.g., `●` for green/enabled vs `○` for gray/disabled), not ANSI color codes, since the snapshot is text-only.

## Verification

1. `just dev` → type `/login` → see the two-pane modal open.
2. Left pane lists all providers. Providers with auth in config are green; others are gray.
3. Press Enter on a provider → it turns green, right pane shows its models.
4. Press Tab → focus moves to the right pane. jk scrolls models.
5. Type "gpt" → both panes filter: only providers with "gpt" models remain, models matching "gpt" are shown.
6. Select a model → `pi.setModel(...)` is called, modal closes, the model is now active.
7. Close and reopen `/login` → provider toggle states are restored from config.
8. Open `~/.config/nexus/config.json` → see `"providers": { "minimax": { "enabled": true }, ... }`.

## E2E Tests

All e2e tests use the `agent-e2e` CLI via `just agent-e2e <command>`. Each test follows the same pattern:

1. `just agent-e2e setup --label login-rework --agentName <name>` — creates workspace, starts agent.
2. `just agent-e2e send-keys <name> <keys...>` — types `/login` and interacts with the TUI.
3. `just agent-e2e prompt <name> "<instruction>"` — asks the agent to report the TUI state.
4. `just agent-e2e read <name> --lines 100` — captures the terminal snapshot.
5. Snapshot is asserted against expected content.
6. `just agent-e2e close <workspaceId>` — cleans up.

Each snapshot is the raw terminal output (ASCII TUI rendering) captured by `read`. The snapshot is the verifiable artifact — it must contain the expected strings, layout markers, and TUI state to pass.

### Test 1: Two-pane modal opens on `/login`

```bash
just agent-e2e setup --label login-rework --agentName login-test-1
just agent-e2e send-keys login-test-1 Slash l o g i n Enter
just agent-e2e prompt login-test-1 "Report the left pane title, the right pane title, and all provider names listed in the left pane."
just agent-e2e read login-test-1 --lines 100 > snapshots/login-opens-two-pane.jsonl
```

**Snapshot assertion:** The snapshot must contain:
- Left pane title: `Providers` (not `Login`)
- Right pane title: the first provider's name (not `No matching commands`)
- A list of provider names (matching the registered providers from the Nexus provider registry)

### Test 2: Provider toggle on Enter

```bash
just agent-e2e setup --label login-rework --agentName login-test-2
just agent-e2e send-keys login-test-2 Slash l o g i n Enter
just agent-e2e send-keys login-test-2 Enter
just agent-e2e prompt login-test-2 "Report whether the first provider row turned green and whether the right pane now shows models for that provider."
just agent-e2e read login-test-2 --lines 100 > snapshots/provider-toggled-on.jsonl
```

**Snapshot assertion:** The snapshot must contain confirmation that:
- The first provider row shows a green/enable indicator (e.g., `● ProviderName` in green)
- The right pane lists models for that provider (not `No matching commands`)

### Test 3: Tab switches focus between panes

```bash
just agent-e2e setup --label login-rework --agentName login-test-3
just agent-e2e send-keys login-test-3 Slash l o g i n Enter
just agent-e2e send-keys login-test-3 Tab
just agent-e2e prompt login-test-3 "Report whether focus is now on the right pane (models). Press Tab again. Report the focus after that."
just agent-e2e read login-test-3 --lines 100 > snapshots/tab-switches-focus.jsonl
```

**Snapshot assertion:** The snapshot must show focus cycling: left (providers) → right (models) → left on successive Tab presses.

### Test 4: jk navigation in the right pane

```bash
just agent-e2e setup --label login-rework --agentName login-test-4
just agent-e2e send-keys login-test-4 Slash l o g i n Enter
just agent-e2e send-keys login-test-4 Tab
just agent-e2e send-keys login-test-4 k k j
just agent-e2e prompt login-test-4 "Report the currently selected model name in the right pane."
just agent-e2e read login-test-4 --lines 100 > snapshots/jk-navigation-right-pane.jsonl
```

**Snapshot assertion:** The snapshot must show the selected model name shifted up by 2 (k×2) and down by 1 (j×1) from the top of the model list.

### Test 5: Search filters both panes

```bash
just agent-e2e setup --label login-rework --agentName login-test-5
just agent-e2e send-keys login-test-5 Slash l o g i n Enter
just agent-e2e send-keys login-test-5 g p t Enter
just agent-e2e prompt login-test-5 "Report how many providers remain visible in the left pane and which model names appear on the right."
just agent-e2e read login-test-5 --lines 100 > snapshots/search-filters-both-panes.jsonl
```

**Snapshot assertion:** The snapshot must show:
- Only providers with "gpt" models remain visible in the left pane
- The right pane lists only models matching "gpt"
- The search bar shows `Search > gpt` (not the typed query leaking into the modal body)

### Test 6: Model selection sets the model and closes

```bash
just agent-e2e setup --label login-rework --agentName login-test-6
just agent-e2e send-keys login-test-6 Slash l o g i n Enter
just agent-e2e send-keys login-test-6 Tab
just agent-e2e send-keys login-test-6 Enter
just agent-e2e prompt login-test-6 "Report whether pi.setModel() was called, the modal closed, and what model is now in the promptline."
just agent-e2e read login-test-6 --lines 100 > snapshots/model-selection-sets-and-closes.jsonl
```

**Snapshot assertion:** The snapshot must confirm:
- `pi.setModel(...)` was called with the selected model
- The modal closed (back to normal promptline, no modal box visible)
- The active model is reflected in the promptline (e.g., `litellm  gpt-4  off`)

### Test 7: Toggle state persists across sessions

```bash
just agent-e2e setup --label login-rework --agentName login-test-7
just agent-e2e send-keys login-test-7 Slash l o g i n Enter
just agent-e2e send-keys login-test-7 Enter
just agent-e2e send-keys login-test-7 Escape
just agent-e2e send-keys login-test-7 Slash l o g i n Enter
just agent-e2e prompt login-test-7 "Report whether the first provider is still shown as enabled/green on this second open."
just agent-e2e read login-test-7 --lines 100 > snapshots/toggle-persists-across-sessions.jsonl
```

**Snapshot assertion:** The snapshot must show the first provider is green/enabled on the second `/login` open, confirming persistence from config.

### Test 8: Config file written correctly

```bash
just agent-e2e setup --label login-rework --agentName login-test-8
just agent-e2e prompt login-test-8 "Read ~/.config/nexus/config.json and report the 'providers' key if it exists. Show the full JSON value."
just agent-e2e read login-test-8 --lines 100 > snapshots/config-providers-key-exists.jsonl
```

**Snapshot assertion:** The snapshot must contain a `"providers"` key in the config JSON, with at least one provider entry containing `{ "enabled": true }`.

### Test execution

Tests are run sequentially. Each test must complete and produce its snapshot before the next begins, because they share the same label (`login-rework`). After all tests pass, clean up:

```bash
just agent-e2e close w58
```
