# local-image-reader Extension

## Source

The `local-image-reader` extension was ported from the standalone Pi extension at:

```
/Users/alpha/workspace/alpha-innovation-labs/__apps/pi/local-image-reader/src
```

The original was a self-contained npm package (`@earendil-works/pi-local-image-reader`) with ~808 lines of TypeScript source across 12 files. It was built as a Pi extension that reads configuration from Pi's `settings.json` and communicates with OpenAI-compatible multimodal endpoints.

## Features

The rebuilt extension (817 lines across 13 files) provides:

### 1. `local_image_reader` tool
- Registers a Pi tool callable by the LLM.
- Accepts `imagePath` (absolute path to a local image) and `query` (text prompt).
- Supports png, jpeg/jpg, webp, gif, bmp.
- Encodes the image as a base64 data URI.
- Sends a multimodal chat completion request to an OpenAI-compatible API (`/v1/chat/completions`).
- Returns structured JSON with the model's text response and token usage (prompt tokens, completion tokens, total tokens).

### 2. `/local-image` command
- Interactive TUI settings menu accessible via the slash-command prefix.
- View and edit four configuration fields: `url`, `apiKey`, `model`, `maxTokens`.
- For the `model` field: fetches available models from the API via `GET /v1/models` (with POST fallback), presents them as a select list, and allows manual input as a fallback.
- Persists changes to the global `settings.json` immediately after each edit.
- Loops until the user selects "Cancel."

### 3. Configuration persistence
- Reads from the Nexus agent directory's `settings.json` (resolved via `getAgentDirPath()` → checks `NEXUS_CODING_AGENT_DIR` / `PI_CODING_AGENT_DIR` env vars, defaults to `~/.local/share/nexus/agent/settings.json`).
- Settings are keyed as `"local-image-reader"` with sub-keys: `url` (required), `apiKey` (required), `model` (optional), `maxTokens` (optional).
- Config is cached per session and invalidated on `session_start` if the settings file still exists.

### 4. Error handling
- File-not-found errors for missing images.
- Network errors for unreachable API endpoints.
- HTTP error responses parsed and returned as structured JSON.
- Error categorization (file_not_found, config_error, network_error, unknown).

## Extension structure

```
packages/extension-core/src/local-image-reader/
├── constants.ts                          # DEFAULT_SYSTEM_PROMPT, constants
├── index.ts                              # Barrel exports
├── registerLocalImageReaderExtension.ts  # Composition root (registers tool + commands)
├── commands/
│   └── registerCommands.ts               # /local-image interactive settings menu
├── config/
│   ├── loader.ts                         # getGlobalSettingsPath, resolveConfig, read/write JSON helpers
│   ├── schema.ts                         # TypeBox schema for tool parameters
│   ├── types.ts                          # LocalImageReaderConfig interface
│   └── validators.ts                     # validateSettingsEntry
├── image/
│   └── encoder.ts                        # encodeImageToBase64 (file → data URI)
├── request/
│   ├── builder.ts                        # buildMessages, buildRequestBody, buildToolResult
│   ├── executor.ts                       # makeApiRequest, fetchModels, handleApiError
│   └── types.ts                          # ChatCompletionRequest, ChatCompletionResponse, ToolResult
└── tool/
    └── registerTool.ts                   # registerLocalImageTool (tool registration)
```

## Changes from the original

| Aspect | Original (`__apps/pi/local-image-reader`) | Rebuilt (extension-core) |
|--------|------------------------------------------|--------------------------|
| Config path resolution | `PI_CODING_AGENT_DIR` env var (hard requirement, throws if missing) | `getAgentDirPath()` from `@nexus/runtime` (checks `NEXUS_CODING_AGENT_DIR` + `PI_CODING_AGENT_DIR`, defaults to `~/.local/share/nexus/agent`) |
| Config file name | `settings.json` | `settings.json` (same) |
| Entry point | Default export function | `registerLocalImageReaderExtension` (default export, same pattern) |
| Session cache invalidation | None | Added `session_start` listener to invalidate cache and re-validate settings file |
| Node.js `fetch` | Not used (assumed Node 18+) | Uses native `fetch` (same) |
| Feature flags | N/A (standalone package) | Registered in `feature-flags.json` with `"enabled": true` |
| Registration map | N/A (standalone package) | Added to `createExtensionRegisterMap()` |

## Comments

- The `callMultimodalEndpoint` stub from the initial (minimal) version was replaced with the full `makeApiRequest` implementation that performs an actual HTTP POST to `/v1/chat/completions`.
- The hardcoded system prompt ("You are a helpful assistant that analyzes images...") is the same as the original. It can be made configurable if needed.
- The `/local-image` command's model-fetching logic tries `GET /v1/models` first, then falls back to `POST` with an empty messages array — matching the original's two-strategy approach for providers that don't expose the `/v1/models` endpoint.
- The extension reads from the **global** `settings.json` only (no project-local fallback), consistent with the original design. This keeps configuration centralized and avoids per-project noise.
- No tests were ported (the original had none). The feature-flags entry lists `"local_image_reader tool"` and `"/local-image interactive settings menu"` as features for regression coverage.
