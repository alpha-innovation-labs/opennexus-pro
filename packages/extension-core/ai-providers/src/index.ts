/**
 * Re-exports the AiGateway class and all gateway-related types.
 */

export { readProviderConfig } from "./config/readProviderConfig";
export { resolveModels } from "./gateway/cache";
export { AiGateway } from "./gateway/gateway";
export { getGateways } from "./gateway/getGateways";
export type {
	GatewayOptions,
	GatewayProbeResult,
	ProviderStateCache,
} from "./gateway/types";
export { registerAiProvidersExtension } from "./register-ai-providers/registerAiProvidersExtension";
