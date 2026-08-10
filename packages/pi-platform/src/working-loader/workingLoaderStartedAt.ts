import type { PatchableLoader } from "./types";

const workingStartedAt = new WeakMap<PatchableLoader, number>();

/**
 * Gets or initializes the start timestamp for a working loader.
 *
 * @param loader Loader instance.
 * @param now Current timestamp in milliseconds.
 * @returns Start timestamp in milliseconds.
 */
export function getWorkingLoaderStartedAt(loader: PatchableLoader, now: number): number {
  const existing = workingStartedAt.get(loader);
  if (existing !== undefined) return existing;
  workingStartedAt.set(loader, now);
  return now;
}

/**
 * Clears tracked working start time for a loader.
 *
 * @param loader Loader instance.
 */
export function clearWorkingLoaderStartedAt(loader: PatchableLoader): void {
  workingStartedAt.delete(loader);
}
