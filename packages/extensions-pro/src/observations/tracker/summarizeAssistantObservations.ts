import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { buildAssistantObservationPrompt } from "./buildAssistantObservationPrompt.js";
import { parseAssistantObservationOutput } from "./parseAssistantObservationOutput.js";
import { runObservationSummarizer } from "./runObservationSummarizer.js";

/**
 * Summarizes one assistant message into high-level observation bullets.
 *
 * @param pi Pi extension API.
 * @param ctx Pi extension context subset.
 * @param topicTitle Active topic title.
 * @param existingBullets Existing observation bullets.
 * @param thinking Assistant thinking text.
 * @param text Assistant visible answer text.
 * @returns New observation bullets.
 */
export async function summarizeAssistantObservations(
	pi: ExtensionAPI,
	ctx: { cwd: string; model?: { provider?: string; id?: string } },
	topicTitle: string,
	existingBullets: string[],
	thinking: string,
	text: string,
): Promise<string[]> {
	const output = await runObservationSummarizer(
		pi,
		ctx,
		buildAssistantObservationPrompt(topicTitle, existingBullets, thinking, text),
	);
	return parseAssistantObservationOutput(output);
}
