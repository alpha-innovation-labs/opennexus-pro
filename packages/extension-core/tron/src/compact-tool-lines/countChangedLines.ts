import { countContentLines } from "./countContentLines";

/**
 * Counts added and removed lines across one edit-tool payload.
 *
 * @param args Edit tool arguments.
 * @returns Added and removed line totals.
 */
export function countChangedLines(args: {
	edits?: Array<{ oldText?: string; newText?: string }>;
	oldText?: string;
	newText?: string;
}): {
	added: number;
	removed: number;
} {
	const edits =
		Array.isArray(args.edits) && args.edits.length > 0
			? args.edits
			: [{ oldText: args.oldText, newText: args.newText }];

	return edits.reduce(
		(totals, edit) => ({
			added: totals.added + countContentLines(edit.newText),
			removed: totals.removed + countContentLines(edit.oldText),
		}),
		{ added: 0, removed: 0 },
	);
}
