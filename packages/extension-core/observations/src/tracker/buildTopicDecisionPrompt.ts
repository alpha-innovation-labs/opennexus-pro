import type { ObservationTopic } from "./types";

/**
 * Builds the prompt that decides whether a user message starts a new topic.
 *
 * @param currentTopic Current intent topic receiving live observations.
 * @param latestUserText Latest user message.
 * @returns Topic decision prompt.
 */
export function buildTopicDecisionPrompt(
	currentTopic: ObservationTopic | undefined,
	latestUserText: string,
): string {
	const currentBatch = currentTopic
		? [
				`Current topic: ${currentTopic.title}`,
				"Current intent batch:",
				...currentTopic.userMessages.map((message) => `User: ${message}`),
				...currentTopic.assistantBullets.map(
					(bullet) => `Assistant observation: ${bullet}`,
				),
			].join("\n")
		: "There is no current topic yet.";
	return [
		"You decide whether the latest user message still fits the current user intent.",
		currentBatch,
		`Latest user message:\n${latestUserText}`,
		currentTopic
			? 'If the latest message fits the current intent, output exactly {"action":"keep"}.'
			: "For the first user message, classify the initial intent as a new topic.",
		'If user intent shifted, output exactly {"action":"new_topic","title":"verb-led topic under 8 words"}.',
		"Topic titles must clearly name the user intent.",
		"Start every topic title with a verb in imperative form.",
		"Output ONLY valid JSON, with no markdown fences and no commentary.",
	].join("\n\n");
}
