import { renderDiff, type Theme } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";

/** Renders captured mutation content without Pi's file-reading call previews. */
export function createMutationToolDetails(
	toolName: string,
	args: Record<string, unknown> | undefined,
	details: unknown,
	theme: Theme,
): Text | undefined {
	if (toolName === "write" && typeof args?.content === "string") {
		return new Text(args.content.length === 0
			? theme.fg("muted", "[empty file]")
			: theme.fg("toolOutput", args.content.replace(/\t/g, "    ")), 0, 0);
	}
	if (toolName !== "edit") return undefined;

	// The executed diff is authoritative. Pi's result renderer can otherwise
	// suppress it when it believes a native call-preview component displays it.
	const diff = details && typeof details === "object" && "diff" in details ? details.diff : undefined;
	if (typeof diff === "string" && diff.trim()) return new Text(renderDiff(diff), 0, 0);

	const edits = Array.isArray(args?.edits) ? args.edits : args ? [args] : [];
	const blocks: string[] = [];
	for (const edit of edits) {
		if (!edit || typeof edit.oldText !== "string" || typeof edit.newText !== "string") continue;
		const removed = edit.oldText ? edit.oldText.split("\n").map((line: string) => `- ${line}`) : [];
		const added = edit.newText ? edit.newText.split("\n").map((line: string) => `+ ${line}`) : [];
		blocks.push([...removed, ...added].join("\n") || "[empty replacement]");
	}
	return blocks.length ? new Text(renderDiff(blocks.join("\n\n")), 0, 0) : undefined;
}
