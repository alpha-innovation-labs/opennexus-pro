/**
 * Finds the last possible start of a terminal inline image sequence.
 *
 * @param data Terminal output text.
 * @returns Sequence start index, or -1 when absent.
 */
export function findTerminalImageSequenceStart(data: string): number {
  return Math.max(data.lastIndexOf("\u001b]1337;File="), data.lastIndexOf("\u001b_G"), data.endsWith("\u001b") ? data.length - 1 : -1);
}
