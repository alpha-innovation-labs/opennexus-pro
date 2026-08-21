import { AiGateway } from "../index";
import { baseUrlFromPort } from "./types";

/**
 * Name lookup for every known provider, keyed by providerId.
 *
 * Mirrors `DEFAULT_PORTS` so the factory can assign a human-readable display
 * name without duplicating port configuration.
 */
const PROVIDER_NAMES: Record<string, string> = {
	vllm: "vLLM",
	ollama: "Ollama",
	"llama.cpp": "llama.cpp",
	localai: "LocalAI",
	sglang: "SGLang",
	jan: "Jan AI",
	llamafile: "llamafile",
	"tensorrt-llm": "TensorRT-LLM",
	lmddeploy: "LMDeploy",
	"mlx-lm": "MLX-LM",
	"mlx-openai-server": "mlx-openai-server",
	omlx: "oMLX",
	lemonade: "Lemonade",
	"docker-model-runner": "Docker Model Runner",
	koboldcpp: "KoboldCpp",
	exllamav2: "exllamav2",
	gpt4all: "GPT4All",
	h2ogpt: "h2oGPT",
	"text-generation-webui": "text-generation-webui",
	"open-webui": "open-webui",
	litellm: "LiteLLM",
	harbor: "Harbor",
	openllm: "OpenLLM",
	"lm-studio": "LM Studio",
	mtplx: "MTPx",
};

/**
 * Options accepted by `createGateway`. */
export interface CreateGatewayOptions {
	/** Optional override for the default URL. */
	baseUrl?: string;
	/** Optional API key (defaults to `""`). */
	apiKey?: string;
}

/**
 * Creates a generic `AiGateway` instance for any known provider.
 *
 * Looks up the default port from `DEFAULT_PORTS` and the display name from
 * `PROVIDER_NAMES`, then passes them to the `AiGateway` base class.
 *
 * @param providerId — Provider identifier (e.g. `"ollama"`, `"vllm"`).
 * @param options — Optional `baseUrl` override and `apiKey`.
 * @returns A configured `AiGateway` instance.
 * @throws If `providerId` is unknown (no default port registered).
 */
export function createGateway(
	providerId: string,
	options: CreateGatewayOptions = {},
): AiGateway {
	const name = PROVIDER_NAMES[providerId] ?? providerId;
	let baseUrl = options.baseUrl ?? baseUrlFromPort(providerId);

	// Append /v1 to baseUrl for providers that require it for inference.
	// Pi uses baseUrl directly for inference requests (e.g.
	// /chat/completions).  Without /v1, LM Studio and Ollama return 404.
	// Crossbar's adapters all add /v1 via inferenceBaseUrl for the same
	// reason.  Only append when the URL does not already end with /v1
	// and the provider is one that uses the OpenAI-compatible /v1 API.
	const OPENAI_COMPATIBLE = new Set([
		"lm-studio",
		"ollama",
		"litellm",
		"vllm",
		"llama.cpp",
		"localai",
		"sglang",
		"jan",
		"llamafile",
		"tensorrt-llm",
		"lmddeploy",
		"mlx-lm",
		"mlx-openai-server",
		"omlx",
		"lemonade",
		"docker-model-runner",
		"koboldcpp",
		"exllamav2",
		"gpt4all",
		"h2ogpt",
		"text-generation-webui",
		"open-webui",
		"harbor",
		"openllm",
		"mtplx",
	]);
	if (OPENAI_COMPATIBLE.has(providerId) && !baseUrl.endsWith("/v1")) {
		baseUrl = `${baseUrl}/v1`;
	}

	return new AiGateway({
		providerId,
		name,
		baseUrl,
		apiKey: options.apiKey,
	});
}
