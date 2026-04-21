/**
 * Estimates how many file diffs one tool call can produce.
 *
 * @param toolName Tool name.
 * @param args Tool arguments.
 * @returns Diff count contribution.
 */
export function getToolDiffCount(toolName: string, args: Record<string, unknown>): number {
	if (toolName === "write") return 1;
	if (toolName !== "edit") return 0;
	if (Array.isArray(args.edits) && args.edits.length > 0) return args.edits.length;
	return 1;
}
