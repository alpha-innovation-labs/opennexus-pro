/**
 * Counts added and removed lines contributed by one tool call.
 *
 * @param toolName Tool name.
 * @param args Tool arguments.
 * @returns Added and removed line totals.
 */
export function getToolLineChangeStats(
	toolName: string,
	args: Record<string, unknown>,
): { added: number; removed: number } {
	if (toolName === "write") {
		const content = typeof args.content === "string" ? args.content : "";
		return { added: content ? content.split("\n").length : 0, removed: 0 };
	}

	if (toolName !== "edit") return { added: 0, removed: 0 };

	const edits =
		Array.isArray(args.edits) && args.edits.length > 0
			? args.edits
			: [{ oldText: args.oldText, newText: args.newText }];

	return edits.reduce(
		(totals, edit) => ({
			added:
				totals.added +
				(typeof edit?.newText === "string" && edit.newText
					? edit.newText.split("\n").length
					: 0),
			removed:
				totals.removed +
				(typeof edit?.oldText === "string" && edit.oldText
					? edit.oldText.split("\n").length
					: 0),
		}),
		{ added: 0, removed: 0 },
	);
}
