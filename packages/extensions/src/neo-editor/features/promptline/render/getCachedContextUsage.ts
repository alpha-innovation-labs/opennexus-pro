import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createContextUsageCacheKey } from "./createContextUsageCacheKey.js";

type ContextUsage = ReturnType<ExtensionContext["getContextUsage"]>;

interface CachedContextUsage {
  key: string;
  usage: ContextUsage;
}

const contextUsageByContext = new WeakMap<object, CachedContextUsage>();

/**
 * Returns context usage without recomputing it for unchanged promptline renders.
 *
 * @param ctx Extension context.
 * @returns Cached or freshly computed context usage.
 */
export function getCachedContextUsage(ctx: ExtensionContext): ContextUsage {
  const cacheKey = createContextUsageCacheKey(ctx);
  const cached = contextUsageByContext.get(ctx as object);
  if (cached?.key === cacheKey) return cached.usage;

  const getContextUsage = (ctx as unknown as { getContextUsage?: () => ContextUsage }).getContextUsage;
  const usage = typeof getContextUsage === "function" ? getContextUsage.call(ctx) : undefined;
  contextUsageByContext.set(ctx as object, { key: cacheKey, usage });
  return usage;
}
