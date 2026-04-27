/**
 * Builds the prompt that summarizes assistant thinking into observation bullets.
 *
 * @param topicTitle Active topic title.
 * @param existingBullets Existing observation bullets.
 * @param thinking Assistant thinking text.
 * @param text Assistant visible answer text.
 * @returns Observation summarizer prompt.
 */
export function buildAssistantObservationPrompt(
	topicTitle: string,
	existingBullets: string[],
	thinking: string,
	text: string,
): string {
	const existing = existingBullets.length > 0
		? existingBullets.map((bullet) => `- ${bullet}`).join("\n")
		: "No existing observations yet.";
	return [
		"You maintain a bird's-eye observation log of an AI assistant's reasoning for one topic.",
		`Active topic:\n${topicTitle}`,
		`Existing observations:\n${existing}`,
		thinking ? `Assistant thinking:\n${thinking}` : "Assistant thinking:\n(none)",
		text ? `Assistant visible answer:\n${text}` : "Assistant visible answer:\n(none)",
		"Output ONLY new markdown bullet points worth adding to the observation log.",
		"Summaries must be very high level, short, and non-duplicative.",
		"Capture decisions, findings, directions, or reframes.",
		"Use at most 3 bullets, each under 10 words.",
		"Output NOTHING if there is nothing materially new.",
		"No numbering or commentary.",
	].join("\n\n");
}
