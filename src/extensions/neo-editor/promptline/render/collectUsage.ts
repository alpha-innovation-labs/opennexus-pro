import type { AssistantMessage } from "@mariozechner/pi-ai";
import type { ExtensionContext } from "@mariozechner/pi-coding-agent";

/**
 * Collects aggregate assistant token and cost usage from the current branch.
 *
 * @param ctx Extension context.
 * @returns Aggregate usage values.
 */
export function collectUsage(ctx: ExtensionContext): { totalTokens: number; cost: number } {
  let totalTokens = 0;
  let cost = 0;

  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type !== "message" || entry.message.role !== "assistant") continue;
    const message = entry.message as AssistantMessage;
    totalTokens += (message.usage?.input ?? 0) + (message.usage?.output ?? 0);
    cost += message.usage?.cost?.total ?? 0;
  }

  return { totalTokens, cost };
}
