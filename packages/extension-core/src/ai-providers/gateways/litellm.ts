import { AiGateway } from "../AiGateway.js";

export class LiteLLmGateway extends AiGateway {
  constructor(options: { apiKey?: string } = {}) {
    super({
      providerId: "litellm",
      name: "LiteLLM",
      baseUrl: "http://localhost:4000",
      // TODO: CRITICAL, MUST be removed and NOT hardcoded, once the settings are created
      apiKey: options.apiKey ?? "sk-1234",
    });
  }
}
