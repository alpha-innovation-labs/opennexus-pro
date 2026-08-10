import type { ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { ContextUsageRuntimeSnapshot } from "./types";
import { getBranchMessages } from "./getBranchMessages";
import { getContextWindow } from "./getContextWindow";
import { getLatestSystemPromptOptions } from "./contextUsageState";
import { getModelDisplayName } from "./getModelDisplayName";
import { normalizeContextUsage } from "./normalizeContextUsage";

/**
 * Creates a live context usage snapshot from the active Nexus runtime context.
 *
 * @param ctx Extension context.
 * @returns Runtime snapshot for report building.
 */
export function createRuntimeSnapshot(ctx: ExtensionContext | ExtensionCommandContext): ContextUsageRuntimeSnapshot {
  const contextWindow = getContextWindow(ctx);
  return {
    usage: normalizeContextUsage(ctx.getContextUsage() ?? null, contextWindow),
    modelName: getModelDisplayName(ctx),
    systemPrompt: ctx.getSystemPrompt(),
    systemPromptOptions: getLatestSystemPromptOptions(),
    messages: getBranchMessages(ctx),
  };
}
