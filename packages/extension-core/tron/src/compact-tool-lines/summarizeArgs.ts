import { countChangedLines } from "./countChangedLines";
import { countContentLines } from "./countContentLines";
import { firstLine } from "./firstLine";
import type { SummaryText } from "./SummaryText";
import { shortenPath } from "./shortenPath";
import { summarizeGenericObjectArgs } from "./summarizeGenericObjectArgs";
import { truncateSingleLine } from "./truncateSingleLine";
import { truncateSingleLineFromStart } from "./truncateSingleLineFromStart";

/**
 * Builds a compact one-line summary for tool-call arguments.
 *
 * @param toolName Tool name.
 * @param args Raw tool-call arguments.
 * @returns Main text plus option text.
 */
export function summarizeArgs(toolName: string, args: unknown): SummaryText {
	const options: string[] = [];

	switch (toolName) {
		case "read":
			if (args.offset) options.push(`offset=${args.offset}`);
			if (args.limit) options.push(`limit=${args.limit}`);
			return { main: shortenPath(args.path || ""), options: options.join(" ") };
		case "bash":
			if (args.timeout) options.push(`timeout=${args.timeout}`);
			return { main: firstLine(args.command), options: options.join(" ") };
		case "edit": {
			const { added, removed } = countChangedLines(args);
			const edits = Array.isArray(args.edits) ? args.edits : [];
			const previewSource =
				edits[0]?.oldText || edits[0]?.newText || args.oldText || args.newText;
			return {
				main: truncateSingleLineFromStart(
					`${shortenPath(args.path || "")} ${truncateSingleLine(firstLine(previewSource), 80)}`.trim(),
					140,
				),
				options: "",
				inlineStats: `+${added} -${removed}`,
			};
		}
		case "write":
			return {
				main: truncateSingleLineFromStart(shortenPath(args.path || ""), 140),
				options: truncateSingleLine(firstLine(args.content), 80),
				inlineStats: `+${countContentLines(args.content)} -0`,
			};
		case "find":
			if (args.limit) options.push(`limit=${args.limit}`);
			return {
				main: truncateSingleLineFromStart(
					[args.path && shortenPath(args.path), args.pattern]
						.filter(Boolean)
						.join(" "),
					140,
				),
				options: options.join(" "),
			};
		case "grep":
			if (args.glob) options.push(`glob=${args.glob}`);
			if (args.ignoreCase) options.push("ignoreCase");
			if (args.literal) options.push("literal");
			if (args.context) options.push(`context=${args.context}`);
			if (args.limit) options.push(`limit=${args.limit}`);
			return {
				main: truncateSingleLineFromStart(
					[
						args.path && shortenPath(args.path),
						args.pattern && `pattern=${args.pattern}`,
					]
						.filter(Boolean)
						.join(" "),
					140,
				),
				options: options.join(" "),
			};
		case "ls":
			if (args.limit) options.push(`limit=${args.limit}`);
			return {
				main: shortenPath(args.path || "."),
				options: options.join(" "),
			};
		default:
			return summarizeGenericObjectArgs(args);
	}
}
