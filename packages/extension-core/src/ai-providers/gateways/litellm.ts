import { AiGateway } from "../AiGateway.js";

export class LiteLLmGateway extends AiGateway {
  constructor(options: { apiKey?: string } = {}) {
    super({
      providerId: "litellm",
      name: "LiteLLM",
      baseUrl: "http://localhost:4000",
      apiKey: options.apiKey ?? "sk-1234",
    });
  }
}
