import type { EditToolParams } from "@earendil-works/pi-coding-agent";
import { countChangedLines } from "./countChangedLines";
import { countContentLines } from "./countContentLines";
import { firstLine } from "./firstLine";
import type { SummaryText } from "./SummaryText";
import { shortenPath } from "./shortenPath";
import { summarizeGenericObjectArgs } from "./summarizeGenericObjectArgs";
import { truncateSingleLine } from "./truncateSingleLine";
import { truncateSingleLineFromStart } from "./truncateSingleLineFromStart";

type ReadParams = { path?: string; offset?: number; limit?: number };
type BashParams = { command?: string; timeout?: number };
type WriteParams = { path?: string; content?: string };
type FindParams = { path?: string; pattern?: string; limit?: number };
type GrepParams = {
	path?: string;
	pattern?: string;
	glob?: string;
	ignoreCase?: boolean;
	literal?: boolean;
	context?: number;
	limit?: number;
};
type LsParams = { path?: string; limit?: number };

/**
 * Builds a compact one-line summary for tool-call arguments.
 *
 * @param toolName Tool name.
 * @param args Raw tool-call arguments.
 * @returns Main text plus option text.
 */
export function summarizeArgs(toolName: string, args: Record<string, unknown>): SummaryText {
	const options: string[] = [];

	switch (toolName) {
		case "read": {
			const r = args as ReadParams;
			if (r.offset) options.push(`offset=${r.offset}`);
			if (r.limit) options.push(`limit=${r.limit}`);
			return { main: shortenPath(r.path || ""), options: options.join(" ") };
		}
		case "bash": {
			const b = args as BashParams;
			if (b.timeout) options.push(`timeout=${b.timeout}`);
			return { main: firstLine(b.command || ""), options: options.join(" ") };
		}
		case "edit": {
			const e = args as EditToolParams;
			const { added, removed } = countChangedLines(e);
			const edits = Array.isArray(e.edits) ? e.edits : [];
			const previewSource =
				edits[0]?.oldText || edits[0]?.newText || e.oldText || e.newText;
			return {
				main: truncateSingleLineFromStart(
					`${shortenPath(e.path || "")} ${truncateSingleLine(firstLine(previewSource || ""), 80)}`.trim(),
					140,
				),
				options: "",
				inlineStats: `+${added} -${removed}`,
			};
		}
		case "write": {
			const w = args as WriteParams;
			return {
				main: truncateSingleLineFromStart(shortenPath(w.path || ""), 140),
				options: truncateSingleLine(firstLine(w.content || ""), 80),
				inlineStats: `+${countContentLines(w.content || "")} -0`,
			};
		}
		case "find": {
			const f = args as FindParams;
			if (f.limit) options.push(`limit=${f.limit}`);
			return {
				main: truncateSingleLineFromStart(
					[f.path && shortenPath(f.path), f.pattern]
						.filter(Boolean)
						.join(" "),
					140,
				),
				options: options.join(" "),
			};
		}
		case "grep": {
			const g = args as GrepParams;
			if (g.glob) options.push(`glob=${g.glob}`);
			if (g.ignoreCase) options.push("ignoreCase");
			if (g.literal) options.push("literal");
			if (g.context) options.push(`context=${g.context}`);
			if (g.limit) options.push(`limit=${g.limit}`);
			return {
				main: truncateSingleLineFromStart(
					[
						g.path && shortenPath(g.path),
						g.pattern && `pattern=${g.pattern}`,
					]
						.filter(Boolean)
						.join(" "),
					140,
				),
				options: options.join(" "),
			};
		}
		case "ls": {
			const l = args as LsParams;
			if (l.limit) options.push(`limit=${l.limit}`);
			return {
				main: shortenPath(l.path || "."),
				options: options.join(" "),
			};
		}
		default:
			return summarizeGenericObjectArgs(args);
	}
}
