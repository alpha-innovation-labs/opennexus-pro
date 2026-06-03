const DEFAULT_STEER_QUEUE_POLL_MS = 250;
const MIN_STEER_QUEUE_POLL_MS = 10;

/**
 * Reads the steering queue poll interval from the environment.
 *
 * @param env Environment variables.
 * @returns Poll interval in milliseconds.
 */
export function readSteerQueuePollIntervalMs(env: NodeJS.ProcessEnv = process.env): number {
  const parsed = Number.parseInt(env.NEXUS_STEER_QUEUE_POLL_MS ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_STEER_QUEUE_POLL_MS;
  return Math.max(MIN_STEER_QUEUE_POLL_MS, parsed);
}
