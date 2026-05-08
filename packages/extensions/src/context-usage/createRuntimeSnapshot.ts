import type { ExtensionCommandContext, ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { ContextUsageRuntimeSnapshot } from "./types.js";
import { getBranchMessages } from "./getBranchMessages.js";
import { getContextWindow } from "./getContextWindow.js";
import { getLatestSystemPromptOptions } from "./contextUsageState.js";
import { getModelDisplayName } from "./getModelDisplayName.js";
import { normalizeContextUsage } from "./normalizeContextUsage.js";

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
