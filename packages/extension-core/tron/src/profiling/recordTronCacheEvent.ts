import { writeTronProfileEvent } from "./writeTronProfileEvent";

type TronCacheStats = {
  hits: number;
  misses: number;
};

const cacheStats = new Map<string, TronCacheStats>();
const LOG_EVERY_EVENTS = 100;

/**
 * Records aggregate hit/miss counts for one Tron render cache.
 *
 * @param name Cache name.
 * @param hit Whether the cache was hit.
 * @param data Extra diagnostic data.
 */
export function recordTronCacheEvent(name: string, hit: boolean, data: Record<string, unknown> = {}): void {
  const stats = cacheStats.get(name) ?? { hits: 0, misses: 0 };
  if (hit) stats.hits += 1;
  else stats.misses += 1;
  cacheStats.set(name, stats);

  const total = stats.hits + stats.misses;
  if (total % LOG_EVERY_EVENTS !== 0) return;
  writeTronProfileEvent("cache:summary", {
    name,
    hits: stats.hits,
    misses: stats.misses,
    hitRate: Number((stats.hits / total).toFixed(3)),
    ...data,
  });
}
