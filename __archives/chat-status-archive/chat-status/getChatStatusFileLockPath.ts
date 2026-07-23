/**
 * Resolves the lock directory path for a chat-status file.
 *
 * @param filePath Chat-status file path.
 * @returns Lock directory path.
 */
export function getChatStatusFileLockPath(filePath: string): string {
  return `${filePath}.lock`;
}
