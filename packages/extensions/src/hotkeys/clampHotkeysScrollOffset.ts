/**
 * Clamps the hotkeys modal scroll offset to available content.
 *
 * @param offset Requested scroll offset.
 * @param totalLines Total rendered content lines.
 * @param visibleLines Visible content line count.
 * @returns Safe scroll offset.
 */
export function clampHotkeysScrollOffset(offset: number, totalLines: number, visibleLines: number): number {
  return Math.max(0, Math.min(offset, Math.max(0, totalLines - visibleLines)));
}
