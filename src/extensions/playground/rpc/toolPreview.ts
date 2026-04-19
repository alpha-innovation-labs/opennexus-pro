import { shorten } from "./shorten.js";

/**
 * Builds a compact preview for one tool execution event.
 *
 * @param toolName Tool name.
 * @param args Tool arguments.
 * @returns Compact tool preview.
 */
export function toolPreview(toolName: string | undefined, args: Record<string, unknown> | undefined): string {
	if (!toolName) return "tool";
	if (toolName === "bash") return `$ ${shorten(String(args?.command ?? ""), 70)}`;
	if (toolName === "read") return `read ${String(args?.path ?? "")}`;
	if (toolName === "write") return `write ${String(args?.path ?? "")}`;
	if (toolName === "edit") return `edit ${String(args?.path ?? "")}`;
	if (toolName === "grep") return `grep ${String(args?.pattern ?? "")}`;
	if (toolName === "find") return `find ${String(args?.pattern ?? "")}`;
	if (toolName === "ls") return `ls ${String(args?.path ?? ".")}`;
	return `${toolName} ${shorten(JSON.stringify(args ?? {}), 60)}`;
}
