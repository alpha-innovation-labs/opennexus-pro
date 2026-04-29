/**
 * Calculates whether a simulated chat event should be visible.
 *
 * @param frame Local scene frame.
 * @param startFrame Frame where the event appears.
 * @returns True when the event should be visible.
 */
export function isChatEventVisible(frame: number, startFrame: number): boolean {
  return frame >= startFrame;
}
