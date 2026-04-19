/**
 * Builds the prompt that decides whether a user message starts a new topic.
 *
 * @param existingTitles Existing topic titles.
 * @param latestUserText Latest user message.
 * @returns Topic decision prompt.
 */
export function buildTopicDecisionPrompt(existingTitles: string[], latestUserText: string): string {
	return [
		"You maintain a chronological list of high-level conversation topics.",
		existingTitles.length > 0
			? `Existing topics:\n${existingTitles.map((title) => `- ${title}`).join("\n")}`
			: "There are no existing topics yet.",
		`Latest user message:\n${latestUserText}`,
		existingTitles.length > 0
			? "Output ONLY one markdown bullet if this starts a NEW high-level topic. Output NOTHING if it stays on the current topic."
			: "Output ONLY one markdown bullet for the first high-level topic.",
		"Keep the topic title under 8 words.",
		"Start every topic title with a verb in imperative form.",
		"Examples: 'Fix terminal overlay sizing', 'Review tool call thinking'.",
		"Do not start with bare nouns like 'Terminal overlay sizing'.",
		"Be business-level and human-readable.",
		"No numbering, no commentary, no explanation.",
	].join("\n\n");
}
