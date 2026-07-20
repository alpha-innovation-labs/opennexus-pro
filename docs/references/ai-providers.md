# Local LLM Gateway Support in Nexus

## Architecture

Nexus registers local LLM inference servers as custom Pi providers at startup. Each gateway is a running inference server that exposes an OpenAI-compatible API with `/v1/models`.

### File Structure

```
packages/extension-core/src/ai-providers/
├── index.ts                          # Re-exports AiGateway, getGateways, registerAiProvidersExtension
├── AiGateway.ts                      # Base class with exists(), getModels(), registerProvider()
├── registerAiProvidersExtension.ts   # Extension entry: strips built-in OAuth providers, registers all gateways
├── constants/
│   └── default-ports.ts              # Port map for 24 supported local LLM servers
└── gateways/
    ├── index.ts                      # Re-exports gateway classes
    ├── litellm.ts                    # LiteLLM gateway (port 4000, apiKey "sk-1234")
    └── lm-studio.ts                  # LM Studio gateway (port 1234, no apiKey)
```

### How It Works

1. **Extension loads** at Nexus startup via `registerCompiledEnabledExtensions.ts`
2. **Built-in Pi OAuth providers** (anthropic, github-copilot, google-gemini-cli, google-antigravity, openai-codex) are unregistered via `pi.unregisterProvider()`
3. **Each gateway** calls `pi.registerProvider()` with:
   - `providerId` — unique identifier (e.g. `"litellm"`, `"lm-studio"`)
   - `baseUrl` — the server's HTTP endpoint
   - `apiKey` — optional API key (empty string = no auth)
   - `api` — API compat type (defaults to `"openai-completions"`)
   - `models` — explicit model list fetched at startup (prevents Pi from merging built-in catalog)
   - `refreshModels` — callback for on-demand model refresh (e.g. after `/reload`)

### Registering a New Gateway

1. Create `gateways/my-provider.ts`:
   ```ts
   import { AiGateway } from "../AiGateway.js";

   export class MyProviderGateway extends AiGateway {
     constructor(options: { apiKey?: string } = {}) {
       super({
         providerId: "my-provider",
         name: "My Provider",
         baseUrl: "http://localhost:3000",
         apiKey: options.apiKey ?? "",
       });
     }
   }
   ```

2. Add `new MyProviderGateway()` to the array in `registerAiProvidersExtension.ts`:
   ```ts
   import { MyProviderGateway } from "./gateways/my-provider.js";
   // ...
   const gateways = [
     new LiteLLmGateway(),
     new LmStudioGateway(),
     new MyProviderGateway(),
   ];
   ```

That's all — no other file changes needed.

## The AiGateway Base Class

### Methods

| Method | Description |
|---|---|
| `exists()` | Probes `/v1/models` to confirm the gateway is alive. Returns `true`/`false`. |
| `getModels()` | Fetches models from `/v1/models`, filters out embedding models, maps to Pi's model format. |
| `registerProvider(pi)` | Async. Fetches models at startup, registers the provider with Pi. |
| `defaultPort(providerId)` | Static. Returns the default port for a known provider. |
| `baseUrlFromPort(providerId, port?)` | Static. Constructs `http://localhost:<port>` from a provider ID. |

### Embedding Model Filtering

Models are filtered by ID keywords: `embed`, `text-embedding`, `clip`, `bge`, `mxbai`, `nomic-embed`. Only LLMs appear in the model picker.

### Default Ports

All 24 supported local LLM servers are defined in `constants/default-ports.ts`:

| Provider | Port | Provider | Port |
|---|---|---|---|
| vLLM | 8000 | Ollama | 11434 |
| LM Studio | 1234 | llama.cpp | 8080 |
| LocalAI | 8080 | SGLang | 30000 |
| Jan AI | 1337 | llamafile | 8080 |
| TensorRT-LLM | 8000 | LMDeploy | 23333 |
| MLX / mlx-lm | 8080 | oMLX | 8000 |
| Lemonade (AMD) | 8080 | KoboldCpp | 5001 |
| exllamav2 | 5000 | GPT4All | 4891 |
| h2oGPT | 5000 | text-generation-webui | 7860 |
| open-webui | 3000 | LiteLLM | 4000 |
| Harbor | 3000 | OpenLLM | 3000 |
| Docker Model Runner | 8000 | | |

## Valid Pi API Types

| API Type | Use Case |
|---|---|
| `openai-completions` | Chat-compatible endpoints (LM Studio, Ollama, llama.cpp, etc.) |
| `openai-responses` | OpenAI's Responses API (LiteLLM, GPT-5) |
| `anthropic-messages` | Anthropic |
| `mistral-conversations` | Mistral |
| `google-generative-ai` | Google Gemini |
| `google-vertex` | Google Vertex AI |
| `bedrock-converse-stream` | AWS Bedrock |
| `azure-openai-responses` | Azure OpenAI |
| `openai-codex-responses` | OpenAI Codex |
| `pi-messages` | Pi's internal format |

**There is no `openai-chat`** — using an invalid API type causes "No API provider registered for api: ..." errors.

## Debugging Checklist

When a gateway isn't working:

1. **Check if the server is running** — `curl http://localhost:<port>/v1/models`
2. **Check if auth is required** — does the server have an API key configured?
3. **Verify the API key matches** — the gateway's `apiKey` must match the server's configured key
4. **Check `--list-models`** — confirms models are discoverable: `just dev --list-models`
5. **Check `just dev -p`** — print mode has no model selected and no UI, so it fails with "No model selected" (expected in non-interactive mode)
6. **Verify valid API type** — must be one of Pi's `KnownApi` types (see table above)
7. **Verify models array is explicit** — calling `registerProvider` without a `models` array causes Pi to merge its built-in catalog into the last-registered provider

## Example: Current Gateways

### LiteLLM Gateway

- **Provider ID**: `litellm`
- **Port**: 4000
- **API Key**: `sk-1234`
- **API Type**: `openai-responses` (default from `AiGateway` is `openai-completions`)
- **Models**: Discovered from `GET http://localhost:4000/v1/models`

### LM Studio Gateway

- **Provider ID**: `lm-studio`
- **Port**: 1234
- **API Key**: (empty — no auth required)
- **API Type**: `openai-completions` (default)
- **Models**: Discovered from `GET http://localhost:1234/v1/models`
