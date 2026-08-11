import { formatCompact } from "./formatCompact";

/**
 * Formats current and total context usage.
 *
 * @param currentTokens Current tokens in context.
 * @param contextWindow Total context window.
 * @returns Usage label.
 */
export function formatContextTokenUsage(
	currentTokens: number,
	contextWindow: number,
): string {
	if (contextWindow <= 0) return formatCompact(currentTokens);
	if (contextWindow >= 1_000) {
		const currentInThousands = Math.floor(Math.max(0, currentTokens) / 1_000);
		const currentLabel =
			currentInThousands > 0 ? `${currentInThousands}k` : "0k";
		return `${currentLabel}/${formatCompact(contextWindow)}`;
	}
	return `${formatCompact(currentTokens)}/${formatCompact(contextWindow)}`;
}
