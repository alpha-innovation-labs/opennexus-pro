/**
 * Resolves the configured max number of concurrent background subagents.
 *
 * @returns Positive concurrency limit.
 */
export function getConfiguredConcurrency(): number {
  const rawValue = process.env.NEXUS_SUBAGENT_MAX_CONCURRENT;
  const parsedValue = Number.parseInt(rawValue ?? "4", 10);
  if (!Number.isFinite(parsedValue) || parsedValue < 1) return 4;
  return parsedValue;
}
