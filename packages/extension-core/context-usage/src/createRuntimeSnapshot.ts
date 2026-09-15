import type {
	ExtensionCommandContext,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { getLatestSystemPromptOptions } from "./contextUsageState";
import { getBranchMessages } from "./getBranchMessages";
import { getContextWindow } from "./getContextWindow";
import { getModelDisplayName } from "./getModelDisplayName";
import { normalizeContextUsage } from "./normalizeContextUsage";
import type { ContextUsageRuntimeSnapshot } from "./types";

/**
 * Creates a live context usage snapshot from the active Nexus runtime context.
 *
 * @param ctx Extension context.
 * @returns Runtime snapshot for report building.
 */
export function createRuntimeSnapshot(
	ctx: ExtensionContext | ExtensionCommandContext,
): ContextUsageRuntimeSnapshot {
	const contextWindow = getContextWindow(ctx);
	const getAllTools = (
		ctx as unknown as {
			getAllTools?: () => Array<{
				name: string;
				description: string;
				parameters: unknown;
			}>;
		}
	).getAllTools;
	const toolDefinitions =
		typeof getAllTools === "function"
			? getAllTools.call(ctx).map((t) => ({
					name: t.name,
					description: t.description,
					parameters: t.parameters,
			  }))
			: undefined;
	return {
		usage: normalizeContextUsage(ctx.getContextUsage() ?? null, contextWindow),
		modelName: getModelDisplayName(ctx),
		systemPrompt: ctx.getSystemPrompt(),
		systemPromptOptions: getLatestSystemPromptOptions(),
		messages: getBranchMessages(ctx),
		toolDefinitions,
	};
}
