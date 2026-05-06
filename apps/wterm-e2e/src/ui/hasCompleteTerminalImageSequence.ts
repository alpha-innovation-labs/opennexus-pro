/**
 * Reports whether the possible inline image sequence has its terminator.
 *
 * @param data Terminal output suffix starting at a possible sequence.
 * @returns True when the sequence is complete or not recognized.
 */
export function hasCompleteTerminalImageSequence(data: string): boolean {
  if (data.startsWith("\u001b]1337;File=")) return data.includes("\u0007");
  if (data.startsWith("\u001b_G")) return data.includes("\u001b\\");
  return !data.endsWith("\u001b");
}
