import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { StringEnum } from "@mariozechner/pi-ai";
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
		description: "Write approved tweet raw and distilled markdown into the global Nexus memory tree.",
		promptSnippet: "Store user-approved tweet memory as Projects-compatible raw and distilled markdown references",
		parameters: Type.Object({
			projectName: Type.String({ description: "Confirmed memory project name. Required; never infer silently." }),
			projectDescription: Type.Optional(Type.String({ description: "Required when creating a new project." })),
			kind: StringEnum(["app", "package"] as const),
			appName: Type.Optional(Type.String()),
			packageGroup: Type.Optional(Type.String()),
			packageName: Type.Optional(Type.String()),
			featureName: Type.Optional(Type.String()),
			tweetUrl: Type.String(),
			title: Type.String(),
			rawMarkdown: Type.String(),
			distilledMarkdown: Type.String(),
			keywords: Type.Optional(Type.Array(Type.String())),
			commitMessage: Type.String({ description: "Operation-level git commit message approved by the LLM/user." }),
		}),
		async execute(_toolCallId, params) {
			const root = await resolveMemoryRoot();
			const paths = await writeTweetReference(root, { ...params, updated: new Date().toISOString().slice(0, 10) });
			await commitMemoryOperation(root, params.commitMessage);
			return { content: [{ type: "text", text: `Stored tweet memory:\n- ${paths.rawPath}\n- ${paths.distilledPath}` }], details: paths };
		},
	});
}
