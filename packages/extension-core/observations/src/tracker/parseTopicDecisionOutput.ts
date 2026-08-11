export type TopicDecision =
	| { action: "keep" }
	| { action: "new_topic"; title: string };

/**
 * Parses and validates the live topic-decision JSON returned by the LLM.
 *
 * @param output Raw LLM output.
 * @returns Valid topic decision or undefined when output is invalid.
 */
export function parseTopicDecisionOutput(
	output: string,
): TopicDecision | undefined {
	const trimmed = output.trim();
	if (!trimmed) return undefined;
	try {
		const parsed = JSON.parse(trimmed) as unknown;
		if (!parsed || typeof parsed !== "object") return undefined;
		const candidate = parsed as { action?: unknown; title?: unknown };
		if (candidate.action === "keep") return { action: "keep" };
		if (candidate.action !== "new_topic" || typeof candidate.title !== "string")
			return undefined;
		const title = candidate.title.trim();
		if (!title) return undefined;
		return { action: "new_topic", title };
	} catch {
		return undefined;
	}
}
