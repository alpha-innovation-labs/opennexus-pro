/**
 * Returns the interactive shell launch command used by the browser-hosted PTY.
 */
export function getE2eCommand(shellPath: string): string {
  return `exec '${shellPath}' -il`;
}
