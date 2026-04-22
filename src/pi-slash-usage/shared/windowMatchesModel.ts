import { collectTokens } from "./collectTokens.js";

/**
 * Checks whether a usage window label appears to belong to the active model.
 *
 * @param label Usage window label.
 * @param modelId Active model identifier.
 * @returns True when the window matches the model tokens.
 */
export function windowMatchesModel(label: string, modelId: string | undefined): boolean {
	const ignoredTokens = new Set(["mini", "max", "google", "antigravity", "openai", "anthropic", "github", "copilot", "codex", "zai", "kiro", "aws"]);
	const modelTokens = collectTokens(modelId).filter((token) => !ignoredTokens.has(token));
	const labelTokens = collectTokens(label);
	return modelTokens.length > 0 && modelTokens.every((token) => labelTokens.includes(token));
}
