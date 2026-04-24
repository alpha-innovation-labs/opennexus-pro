import type { ProviderModel, ProviderName } from "../types.js";

/**
 * Detects the normalized provider from Pi model metadata.
 *
 * @param model Active model metadata.
 * @returns Normalized provider name.
 */
export function detectProviderFromModel(model: ProviderModel): ProviderName | undefined {
	const provider = model?.provider?.toLowerCase() ?? "";
	const modelId = model?.id?.toLowerCase() ?? "";
	if (provider.includes("antigravity") || modelId.includes("antigravity")) return "antigravity";
	if (provider.includes("anthropic") || modelId.includes("claude")) return "anthropic";
	if (provider.includes("copilot") || provider.includes("github")) return "copilot";
	if (provider.includes("gemini") || (provider.includes("google") && !provider.includes("antigravity")) || modelId.includes("gemini")) return "gemini";
	if (provider.includes("openai") || provider.includes("codex") || modelId.includes("gpt") || modelId.includes("o1") || modelId.includes("o3")) return "codex";
	if (provider.includes("kiro") || provider.includes("aws")) return "kiro";
	if (provider.includes("zai") || provider.includes("z.ai") || provider.includes("z-ai") || provider.includes("xai")) return "zai";
	return undefined;
}
