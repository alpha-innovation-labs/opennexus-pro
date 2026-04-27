import type { ExtensionContext } from "@mariozechner/pi-coding-agent";

/** Running usage-history sampler state. */
export type UsageHistorySamplerState = {
  ctx: ExtensionContext;
  timer: NodeJS.Timeout;
};

export const usageHistorySamplers = new Map<string, UsageHistorySamplerState>();
