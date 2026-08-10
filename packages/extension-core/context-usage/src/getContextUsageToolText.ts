import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createContextUsageReport } from "./createContextUsageReport.js";
import { createRuntimeSnapshot } from "./createRuntimeSnapshot.js";
import { formatContextUsage } from "./formatContextUsage.js";

/**
 * Builds the context usage text returned by the LLM-callable tool.
 *
 * @param ctx Tool execution context.
 * @returns Formatted context usage text.
 */
export async function getContextUsageToolText(ctx: ExtensionContext): Promise<string> {
  return formatContextUsage(await createContextUsageReport(createRuntimeSnapshot(ctx)));
}
