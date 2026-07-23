import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createUsageHistoryRecords } from "./createUsageHistoryRecord.js";
import { appendUsageHistoryRecords } from "./appendUsageHistoryRecords.js";
import { refreshUsageForContext } from "../runtime/refreshUsageForContext.js";

/**
 * Fetches current usage and appends history records for the active provider.
 *
 * @param ctx Extension context.
 * @param sampledAt Sampling timestamp.
 */
export async function sampleUsageHistoryForContext(ctx: ExtensionContext, sampledAt = Date.now()): Promise<void> {
  const snapshot = await refreshUsageForContext(ctx, true);
  if (!snapshot) return;
  await appendUsageHistoryRecords(createUsageHistoryRecords(snapshot, ctx.model, sampledAt));
}
