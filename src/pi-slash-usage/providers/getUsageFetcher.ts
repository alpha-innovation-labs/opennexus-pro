import { fetchAnthropicUsage } from "./anthropic/fetchAnthropicUsage.js";
import { fetchAntigravityUsage } from "./antigravity/fetchAntigravityUsage.js";
import { fetchCodexUsage } from "./codex/fetchCodexUsage.js";
import { fetchCopilotUsage } from "./copilot/fetchCopilotUsage.js";
import { fetchGeminiUsage } from "./gemini/fetchGeminiUsage.js";
import { fetchKiroUsage } from "./kiro/fetchKiroUsage.js";
import { fetchZaiUsage } from "./zai/fetchZaiUsage.js";
import type { ProviderName, UsageSnapshot } from "../types.js";

/**
 * Resolves the provider-specific usage fetcher.
 *
 * @param provider Normalized provider name.
 * @returns Usage fetcher for the provider.
 */
export function getUsageFetcher(provider: ProviderName): () => Promise<UsageSnapshot> {
	return {
		anthropic: fetchAnthropicUsage,
		copilot: fetchCopilotUsage,
		gemini: fetchGeminiUsage,
		antigravity: fetchAntigravityUsage,
		codex: fetchCodexUsage,
		kiro: fetchKiroUsage,
		zai: fetchZaiUsage,
	}[provider];
}
