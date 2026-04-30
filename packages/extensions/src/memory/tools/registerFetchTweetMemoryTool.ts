import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { fetchTweetWithJina } from "../twitter/fetchTweetWithJina.js";

/**
 * Registers the tweet fetch tool used before memory distillation.
 *
 * @param pi Extension API.
 */
export function registerFetchTweetMemoryTool(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "memory_fetch_tweet",
		renderShell: "self",
		skipLeadingSpacer: true,
		label: "Fetch Tweet",
		description: "Fetch a Twitter/X status URL through Jina Reader for Nexus memory processing.",
		promptSnippet: "Fetch tweet markdown through Jina Reader before deciding whether to store it in Nexus memory",
		parameters: Type.Object({ tweetUrl: Type.String() }),
		async execute(_toolCallId, params, signal) {
			const text = await fetchTweetWithJina(params.tweetUrl, signal);
			return { content: [{ type: "text", text }], details: { tweetUrl: params.tweetUrl } };
		},
	});
}
