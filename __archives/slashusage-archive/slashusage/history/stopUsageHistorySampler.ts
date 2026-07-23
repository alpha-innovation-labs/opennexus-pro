import { usageHistorySamplers } from "./usageHistorySamplerState.js";

/**
 * Stops the usage history sampler for one cwd.
 *
 * @param cwd Session cwd.
 */
export function stopUsageHistorySampler(cwd: string): void {
  const sampler = usageHistorySamplers.get(cwd);
  if (!sampler) return;
  clearInterval(sampler.timer);
  usageHistorySamplers.delete(cwd);
}
