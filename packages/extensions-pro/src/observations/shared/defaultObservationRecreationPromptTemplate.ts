export const OBSERVATION_RECREATION_MESSAGES_PLACEHOLDER = "{{messages}}";

/**
 * Default template for recreating final observations from full message history.
 */
export const DEFAULT_OBSERVATION_RECREATION_PROMPT_TEMPLATE = [
	"You recreate the final high-level observation log for a conversation.",
	"Read the complete chronological message history once, then identify user-topic drift and the assistant observations for each topic.",
	"A new topic starts only when the user's goal materially changes. Merge adjacent messages that continue the same goal.",
	"Do not copy user messages as topic titles. Titles must summarize the general work area or intent.",
	"Assistant bullets must summarize decisions, findings, implementation direction, or important outcomes from assistant messages.",
	"Output ONLY valid JSON, with no markdown fences and no commentary.",
	"Schema: [{\"title\":\"verb-led topic under 8 words\",\"sourceMessageIndexes\":[1,3],\"userMessages\":[\"short user-message excerpt\"],\"assistantBullets\":[\"short observation\"]}]",
	"sourceMessageIndexes must contain only user message indexes covered by that topic.",
	"userMessages should be short excerpts, not full raw prompts.",
	"assistantBullets should be high-level and non-duplicative. Use an empty array when there are no material assistant observations.",
	"Examples of good titles: \"Review observation storage format\", \"Add session fork CLI\", \"Fix recreation performance\".",
	"Conversation messages:",
	OBSERVATION_RECREATION_MESSAGES_PLACEHOLDER,
].join("\n\n");
