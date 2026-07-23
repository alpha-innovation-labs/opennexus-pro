import { AiGateway } from "../AiGateway.js";

/**
 * Gateway for vLLM, an open-source high-throughput LLM inference engine that
 * exposes an OpenAI-compatible API on port 8000 by default.
 *
 * vLLM serves all API endpoints at the root path (`/chat/completions`), so no
 * `apiPath` prefix is needed — just the base URL.
 */
export class VllmGateway extends AiGateway {
  constructor(options: { apiKey?: string } = {}) {
    super({
      providerId: "vllm",
      name: "vLLM",
      baseUrl: "http://localhost:8000",
      apiKey: options.apiKey ?? "",
    });
  }
}
