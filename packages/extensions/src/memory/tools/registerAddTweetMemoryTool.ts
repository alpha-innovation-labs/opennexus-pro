import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { commitMemoryOperation } from "../git/commitMemoryOperation.js";
import { resolveMemoryRoot } from "../settings/resolveMemoryRoot.js";
import { writeTweetReference } from "../storage/writeTweetReference.js";

/**
 * Registers the tool that writes approved tweet memory markdown.
 *
 * @param pi Extension API.
 */
export function registerAddTweetMemoryTool(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "memory_add_tweet",
		renderShell: "self",
		skipLeadingSpacer: true,
		label: "Add Tweet Memory",
		description: "Write approved tweet raw reference and one-line topic memory into the global Nexus memory tree.",
		promptSnippet: "Store user-approved tweet memory only after project and topic are confirmed",
		parameters: Type.Object({
			projectName: Type.String({ description: "Confirmed memory project name. Required; never infer silently." }),
			projectDescription: Type.Optional(Type.String({ description: "Required when creating a new project." })),
			topicName: Type.String({ description: "Confirmed topic name. Required; never infer silently." }),
			tweetUrl: Type.String(),
			title: Type.String(),
			rawMarkdown: Type.String(),
			distilledMarkdown: Type.String({ description: "One line, maximum 240 characters." }),
			keywords: Type.Optional(Type.Array(Type.String())),
			commitMessage: Type.String({ description: "Operation-level git commit message approved by the LLM/user." }),
		}),
		async execute(_toolCallId, params) {
			const root = await resolveMemoryRoot();
			const paths = await writeTweetReference(root, { ...params, updated: new Date().toISOString().slice(0, 10) });
			await commitMemoryOperation(root, params.commitMessage);
			return { content: [{ type: "text", text: `Stored tweet memory:\n- ${paths.referencePath}\n- ${paths.topicPath}` }], details: paths };
		},
	});
}
