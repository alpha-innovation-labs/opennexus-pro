import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { buildTopicDecisionPrompt } from "./buildTopicDecisionPrompt.js";
import { parseTopicDecisionOutput } from "./parseTopicDecisionOutput.js";
import { runObservationSummarizer } from "./runObservationSummarizer.js";
import type { ObservationTopic } from "./types.js";

/**
 * Decides whether the latest user message starts a new topic.
 *
 * @param pi Pi extension API.
 * @param ctx Pi extension context subset.
 * @param currentTopic Current live intent topic.
 * @param latestUserText Latest user message.
 * @returns New topic title when drift is detected.
 */
export async function decideTopicTitle(
	pi: ExtensionAPI,
	ctx: { cwd: string; model?: { provider?: string; id?: string } },
	currentTopic: ObservationTopic | undefined,
	latestUserText: string,
): Promise<string | undefined> {
	const output = await runObservationSummarizer(
		pi,
		ctx,
		buildTopicDecisionPrompt(currentTopic, latestUserText),
	);
	const decision = parseTopicDecisionOutput(output);
	return decision?.action === "new_topic" ? decision.title : undefined;
}
