import { AiGateway } from "../AiGateway.js";

export class LmStudioGateway extends AiGateway {
  constructor(options: { apiKey?: string } = {}) {
    super({
      providerId: "lm-studio",
      name: "LM Studio",
      baseUrl: "http://localhost:1234",
      apiKey: options.apiKey ?? "",
    });
  }
}
