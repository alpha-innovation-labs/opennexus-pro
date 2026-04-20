/**
 * Returns the interactive shell launch command used by the browser demo PTY.
 */
export function getDemoCommand(shellPath: string): string {
  return `exec '${shellPath}' -il`;
}
