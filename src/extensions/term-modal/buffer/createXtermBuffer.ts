import { createRequire } from "node:module";
import { resolveBundledAssetPath } from "../../../runtime/package/resolveBundledAssetPath.js";
import { lineToAnsi } from "../ansi/lineToAnsi.js";
import type { XtermBuffer } from "../types.js";

const require = createRequire(import.meta.url);
const XTERM_HEADLESS_ENTRY_PATH = resolveBundledAssetPath(
  import.meta.url,
  "runtime/node_modules/@xterm/headless/lib-headless/xterm-headless.js",
  "../../../../node_modules/@xterm/headless/lib-headless/xterm-headless.js",
);

/**
 * Creates the headless xterm display buffer used by the modal.
 *
 * @param cols Terminal column count.
 * @param rows Terminal row count.
 * @param onOutput Data emitted by xterm back toward the PTY.
 * @returns Xterm-backed display buffer API.
 */
export function createXtermBuffer(cols: number, rows: number, onOutput: (data: string) => void): XtermBuffer {
	const { Terminal } = require(XTERM_HEADLESS_ENTRY_PATH) as typeof import("@xterm/headless");
	const term = new Terminal({ cols, rows, scrollback: 5000, allowProposedApi: true });
	const nullCell = term.buffer.active.getNullCell();
	term.onData((data: string) => onOutput(data));
	term.onBinary((data: string) => onOutput(Buffer.from(data, "binary").toString("binary")));

	return {
		write(data: string): void {
			term.write(data);
		},
		input(data: string): void {
			term.input(data);
		},
		resize(nextCols: number, nextRows: number): void {
			try {
				term.resize(nextCols, nextRows);
			} catch {
				// Ignore transient resize failures from the renderer.
			}
		},
		clear(): void {
			term.clear();
		},
		getDisplayLines(start: number, end: number): string[] {
			const buffer = term.buffer.active;
			const lines: string[] = [];
			for (let index = start; index < end && index < buffer.length; index += 1) {
				const line = buffer.getLine(index);
				lines.push(line ? lineToAnsi(line, nullCell) : "");
			}
			return lines;
		},
		lineCount(): number {
			return term.buffer.active.length;
		},
	};
}
