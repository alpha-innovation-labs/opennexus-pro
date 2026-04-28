import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { sampleUsageHistoryForContext } from "./sampleUsageHistoryForContext.js";
import { stopUsageHistorySampler } from "./stopUsageHistorySampler.js";
import { usageHistorySamplers } from "./usageHistorySamplerState.js";

export const USAGE_HISTORY_SAMPLE_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Starts a five-minute usage history sampler for one session cwd.
 *
 * @param cwd Session cwd.
 * @param ctx Extension context.
 * @param intervalMs Sampling interval.
 */
export function startUsageHistorySampler(cwd: string, ctx: ExtensionContext, intervalMs = USAGE_HISTORY_SAMPLE_INTERVAL_MS): void {
  stopUsageHistorySampler(cwd);
  void sampleUsageHistoryForContext(ctx).catch(() => undefined);
  const timer = setInterval(() => {
    void sampleUsageHistoryForContext(ctx).catch(() => undefined);
  }, intervalMs);
  timer.unref?.();
  usageHistorySamplers.set(cwd, { ctx, timer });
}
