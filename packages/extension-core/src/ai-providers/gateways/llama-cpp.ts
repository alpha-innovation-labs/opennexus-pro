import { AiGateway } from "../AiGateway.js";

/**
 * Gateway for llama.cpp's OpenAI-compatible server, which exposes a REST API
 * on port 8080 by default.
 *
 * llama.cpp serves all API endpoints at the root path (`/chat/completions`),
 * so no `apiPath` prefix is needed — just the base URL.
 *
 * Uses a hardcoded placeholder API key to satisfy Pi's request-time validation.
 * Ollama does the same — the key is ignored by the local server.
 */
export class LlamaCppGateway extends AiGateway {
  constructor(options: { apiKey?: string } = {}) {
    super({
      providerId: "llama.cpp",
      name: "llama.cpp",
      baseUrl: "http://localhost:8090",
      apiKey: options.apiKey ?? "llama.cpp",
    });
  }
}
