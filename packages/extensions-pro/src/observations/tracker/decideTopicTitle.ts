import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { buildTopicDecisionPrompt } from "./buildTopicDecisionPrompt.js";
import { normalizeBullets } from "./normalizeBullets.js";
import { runObservationSummarizer } from "./runObservationSummarizer.js";
import { stripMarkdownBullet } from "./stripMarkdownBullet.js";

/**
 * Decides whether the latest user message starts a new topic.
 *
 * @param pi Pi extension API.
 * @param ctx Pi extension context subset.
 * @param existingTitles Existing topic titles.
 * @param latestUserText Latest user message.
 * @returns New topic title when drift is detected.
 */
export async function decideTopicTitle(
	pi: ExtensionAPI,
	ctx: { cwd: string; model?: { provider?: string; id?: string } },
	existingTitles: string[],
	latestUserText: string,
): Promise<string | undefined> {
	const output = await runObservationSummarizer(
		pi,
		ctx,
		buildTopicDecisionPrompt(existingTitles, latestUserText),
	);
	const title = normalizeBullets(output).map(stripMarkdownBullet)[0]?.trim();
	return title || undefined;
}
