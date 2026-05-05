import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { commitMemoryOperation } from "../git/commitMemoryOperation.js";
import { resolveMemoryRoot } from "../settings/resolveMemoryRoot.js";
import { writeTweetReferences } from "../storage/writeTweetReferences.js";

/**
 * Registers the batch tool that commits multiple tweet memories as one operation.
 *
 * @param pi Extension API.
 */
export function registerAddTweetMemoryBatchTool(pi: ExtensionAPI): void {
	const itemSchema = Type.Object({
		projectName: Type.String(),
		projectDescription: Type.Optional(Type.String()),
		topicName: Type.String(),
		tweetUrl: Type.String(),
		title: Type.String(),
		rawMarkdown: Type.String(),
		distilledMarkdown: Type.String({ description: "One line, maximum 240 characters." }),
		keywords: Type.Optional(Type.Array(Type.String())),
	});
	pi.registerTool({
		name: "memory_add_tweets",
		label: "Add Tweet Memories",
		description: "Write multiple approved tweet memories and commit them as one git operation.",
		promptSnippet: "Use memory_add_tweets when storing multiple tweet memories so they share one git commit",
		parameters: Type.Object({ items: Type.Array(itemSchema), commitMessage: Type.String() }),
		async execute(_toolCallId, params) {
			const root = await resolveMemoryRoot();
			const updated = new Date().toISOString().slice(0, 10);
			const paths = await writeTweetReferences(root, params.items.map((item) => ({ ...item, updated })));
			await commitMemoryOperation(root, params.commitMessage);
			return { content: [{ type: "text", text: `Stored ${paths.length} tweet memories in one operation.` }], details: { paths } };
		},
	});
}
