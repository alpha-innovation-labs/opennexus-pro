/**
 * Calculates the visible body height for two-pane modal content.
 *
 * @returns Visible body height.
 */
export function getTwoPaneBodyHeight(): number {
  const terminalRows = process.stdout.rows ?? 30;
  return Math.max(12, Math.floor(terminalRows * 0.8) - 4);
}
