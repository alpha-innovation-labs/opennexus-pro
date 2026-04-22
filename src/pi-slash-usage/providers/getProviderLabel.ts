import type { ProviderName } from "../types.js";

/**
 * Maps a normalized provider name to its widget label.
 *
 * @param provider Normalized provider name.
 * @returns Display label.
 */
export function getProviderLabel(provider: ProviderName): string {
	return {
		anthropic: "claude",
		copilot: "copilot",
		gemini: "gemini",
		antigravity: "antigravity",
		codex: "codex",
		kiro: "kiro",
		zai: "zai",
	}[provider];
}
