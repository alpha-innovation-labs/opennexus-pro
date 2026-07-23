import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

/** Running usage-history sampler state. */
export type UsageHistorySamplerState = {
  ctx: ExtensionContext;
  timer: NodeJS.Timeout;
};

export const usageHistorySamplers = new Map<string, UsageHistorySamplerState>();
