import { visibleWidth } from "@earendil-works/pi-tui";
import stripAnsi from "strip-ansi";
import { truncateAnsiToWidth } from "./truncateAnsiToWidth";

/** Truncates and pads a markdown preview line to the requested visible width. */
export function padMarkdownPreviewLine(value: string, width: number): string {
	const targetWidth = Math.max(0, Math.floor(width));
	const truncated = truncateAnsiToWidth(value, targetWidth);
	const visible = visibleWidth(stripAnsi(truncated));
	return `${truncated}${" ".repeat(Math.max(0, targetWidth - visible))}`;
}
