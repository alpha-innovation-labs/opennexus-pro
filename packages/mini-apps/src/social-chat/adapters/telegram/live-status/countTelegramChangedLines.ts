/**
 * Counts added and removed lines across an edit payload.
 *
 * @param args Edit tool arguments.
 * @returns Added and removed line counts.
 */
export function countTelegramChangedLines(args: { edits?: Array<{ oldText?: string; newText?: string }>; oldText?: string; newText?: string }): {
  added: number;
  removed: number;
} {
  const edits = Array.isArray(args.edits) && args.edits.length > 0 ? args.edits : [{ oldText: args.oldText, newText: args.newText }];

  return edits.reduce(
    (totals, edit) => ({
      added: totals.added + (edit.newText ? edit.newText.split("\n").length : 0),
      removed: totals.removed + (edit.oldText ? edit.oldText.split("\n").length : 0),
    }),
    { added: 0, removed: 0 },
  );
}
