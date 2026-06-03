/**
 * Resolves the lock directory path for a steering queue file.
 *
 * @param filePath Queue file path.
 * @returns Lock directory path.
 */
export function getSteerQueueLockPath(filePath: string): string {
  return `${filePath}.lock`;
}
