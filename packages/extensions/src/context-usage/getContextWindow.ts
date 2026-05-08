import type { ExtensionCommandContext, ExtensionContext } from "@mariozechner/pi-coding-agent";

/**
 * Resolves the active model context window, preferring model metadata over stale usage snapshots.
 *
 * @param ctx Extension context.
 * @returns Context window size in tokens.
 */
export function getContextWindow(ctx: ExtensionContext | ExtensionCommandContext): number {
  return Math.max(ctx.model?.contextWindow ?? 0, ctx.getContextUsage()?.contextWindow ?? 0);
}
