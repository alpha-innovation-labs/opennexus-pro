import { AiGateway } from "../AiGateway.js";

/**
 * Gateway for Ollama, a local LLM inference server that exposes an
 * OpenAI-compatible API on port 11434 by default.
 *
 * Ollama does not require an API key — the gateway is configured with a
 * placeholder key so Pi's validation passes, then Ollama ignores it.
 * The `/v1` path is embedded in baseUrl so Ollama's API routes resolve
 * correctly (e.g. `/v1/chat/completions`).
 */
export class OllamaGateway extends AiGateway {
  constructor(options: { apiKey?: string } = {}) {
    super({
      providerId: "ollama",
      name: "Ollama",
      baseUrl: "http://localhost:11434/v1",
      apiKey: options.apiKey ?? "ollama",
    });
  }
}
