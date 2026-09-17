import {
	sliceByColumn,
	stripTerminalSequences,
	visibleWidth,
	TuiMainScreen,
} from "@earendil-works/pi-tui";
// Deep import: these column primitives are not re-exported from the package entry.
import { extractAnsiCode, getGraphemeSegmenter } from "@earendil-works/pi-tui/dist/utils.js";

let mainScreenSelectionPatchApplied = false;

/**
 * Enable SGR mouse reporting for button press/release and coordinates.
 *
 * `?1002h` (button + all-motion) tracks continuous drag position so the
 * selection highlight stays visible during a live drag. The patch intercepts
 * SGR mouse sequences on stdin but passes wheel events (button bit 6) through
 * unmodified so the terminal can handle history scrollback natively. Right-
 * click and other non-left buttons are still consumed to avoid stray input.
 */
const ENABLE_MOUSE = "\x1b[?1000h\x1b[?1002h\x1b[?1006h";
/** Disable SGR mouse reporting (mirror of ENABLE_MOUSE). */
const DISABLE_MOUSE = "\x1b[?1006l\x1b[?1002l\x1b[?1000l";
/** SGR mouse event shape: `ESC [ < button ; col ; row M` (press) or `... m` (release). */
const SGR_MOUSE_RE = /^\x1b\[<(\d+);(\d+);(\d+)([Mm])$/;
/** Focus gained/lost by the terminal window (independent of mouse tracking). */
const FOCUS_OUT = "\x1b[O";
const FOCUS_IN = "\x1b[I";
/** Max gap between clicks to count as a double/triple click. */
const DOUBLE_CLICK_MS = 500;
/** SGR: enable reverse video (selection highlight) on the cells that follow. */
const REVERSE_ON = "\x1b[7m";
/** SGR: disable reverse video (scoped so the line's original colors are kept). */
const REVERSE_OFF = "\x1b[27m";

/** A point in content coordinates: `row` indexes into the rendered lines, `col` is a visible column. */
interface SelectionPoint {
	row: number;
	col: number;
}

type MouseResult = { consume?: boolean; data?: string } | undefined;

/**
 * Structural view of the TuiMainScreen members this patch reads or wraps.
 *
 * These are `private`/`protected` in the package's types, so the patch casts
 * through `unknown` (the same approach the other pi-platform patches use) and
 * works against this structural shape rather than the declared type.
 */
interface NexusMainScreen {
	_nexusMouseInstalled?: boolean;
	_nexusSelActive?: boolean;
	_nexusLeftPressed?: boolean;
	_nexusSelAnchor?: SelectionPoint | undefined;
	_nexusSelFocus?: SelectionPoint | undefined;
	_nexusLastClick?: { t: number; row: number; col: number; count: number } | null;
	previousLines: string[];
	previousViewportTop: number;
	terminal: {
		columns: number;
		rows: number;
		write(chunk: string): void;
	};
	addInputListener(
		listener: (data: string) => MouseResult,
	): () => void;
	requestRender(): void;
	requestImmediateRender(): void;
	render(width: number): string[];
	beforeTerminalStart?(): void;
	beforeTerminalStop?(options?: unknown): void;
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/**
 * Map a 0-based screen point (from an SGR event) to a content point.
 *
 * In regular mode the visible viewport shows content lines
 * `[previousViewportTop, previousViewportTop + rows)`, so screen row `y` maps to
 * content row `previousViewportTop + y`. While a drag is active the render loop is
 * frozen, so this mapping stays stable for the whole selection.
 */
function toContentPoint(self: NexusMainScreen, x: number, y: number): SelectionPoint {
	const viewportTop = self.previousViewportTop ?? 0;
	const lineCount = self.previousLines?.length ?? 0;
	const maxRow = Math.max(0, lineCount - 1);
	const row = clamp(viewportTop + y, 0, maxRow);
	const col = clamp(x, 0, Math.max(0, self.terminal.columns - 1));
	return { row, col };
}

/**
 * Compute the visible-column boundaries of the word containing `col` in a
 * plain-text line. A word is a maximal run of non-whitespace characters.
 */
function getWordRange(text: string, col: number): { start: number; end: number } | undefined {
	const colAt: number[] = [];
	let cursor = 0;
	for (let i = 0; i < text.length; i++) {
		colAt.push(cursor);
		cursor += visibleWidth(text[i]);
	}
	const totalWidth = cursor;
	if (totalWidth === 0) {
		return undefined;
	}
	const target = clamp(col, 0, totalWidth - 1);
	let index = 0;
	for (let i = 0; i < text.length; i++) {
		if (colAt[i] > target) {
			break;
		}
		index = i;
	}
	const isWordChar = (char: string) => !/\s/.test(char);
	let start = index;
	while (start > 0 && isWordChar(text[start - 1]) && isWordChar(text[start])) {
		start--;
	}
	let end = index;
	while (
		end < text.length - 1 &&
		isWordChar(text[end + 1]) &&
		isWordChar(text[end])
	) {
		end++;
	}
	return { start: colAt[start], end: colAt[end] + visibleWidth(text[end]) };
}

/** Extract the selected text from the frozen rendered lines. */
function extractSelectionText(
	self: NexusMainScreen,
	start: SelectionPoint,
	end: SelectionPoint,
): string {
	const lines = self.previousLines;
	const multiLine = start.row !== end.row;
	const rows: string[] = [];
	for (let row = start.row; row <= end.row; row++) {
		const line = lines[row] ?? "";
		let colStart = 0;
		let colEnd = visibleWidth(line);
		if (row === start.row) {
			colStart = start.col;
		}
		if (row === end.row) {
			colEnd = end.col;
		}
		if (colEnd <= colStart) {
			if (multiLine) {
				rows.push("");
			}
			continue;
		}
		const slice = sliceByColumn(line, colStart, colEnd - colStart, true);
		rows.push(stripTerminalSequences(slice).trimEnd());
	}
	const text = rows.join("\n");
	return multiLine ? text : text.trim();
}

function copyToClipboard(self: NexusMainScreen, text: string): void {
	if (text.length === 0) {
		return;
	}
	const base64 = Buffer.from(text, "utf8").toString("base64");
	self.terminal.write(`\x1b]52;c;${base64}\x07`);
}

function beginPress(self: NexusMainScreen, point: SelectionPoint): void {
	const now = Date.now();
	const previous = self._nexusLastClick ?? null;
	const sameSpot =
		previous !== null && previous.row === point.row && Math.abs(previous.col - point.col) <= 1;
	let granularity: "character" | "word" | "line" = "character";
	if (sameSpot && now - previous.t <= DOUBLE_CLICK_MS) {
		const count = (previous.count % 3) + 1;
		self._nexusLastClick = { t: now, row: point.row, col: point.col, count };
		granularity = count === 2 ? "word" : count === 3 ? "line" : "character";
	} else {
		self._nexusLastClick = { t: now, row: point.row, col: point.col, count: 1 };
	}

	let anchor = point;
	let focus = point;
	const line = self.previousLines[point.row] ?? "";
	if (granularity === "word") {
		const range = getWordRange(stripTerminalSequences(line), point.col);
		if (range) {
			anchor = { row: point.row, col: range.start };
			focus = { row: point.row, col: range.end };
		}
	} else if (granularity === "line") {
		anchor = { row: point.row, col: 0 };
		focus = { row: point.row, col: visibleWidth(line) };
	}

	self._nexusLeftPressed = true;
	self._nexusSelAnchor = anchor;
	self._nexusSelFocus = focus;
	self._nexusSelActive = true;
	// Paint the highlight now in case streaming is idle and no render is pending.
	self.requestRender();
}

function continueDrag(self: NexusMainScreen, point: SelectionPoint): void {
	if (!self._nexusLeftPressed) {
		return;
	}
	self._nexusSelFocus = point;
	self._nexusSelActive = true;
	self.requestRender();
}

function finalizeSelection(self: NexusMainScreen, point: SelectionPoint): void {
	const anchor = self._nexusSelAnchor;
	const focus = self._nexusSelFocus ?? point;
	self._nexusLeftPressed = false;
	self._nexusSelActive = false;
	self._nexusSelAnchor = undefined;
	self._nexusSelFocus = undefined;

	if (anchor) {
		const anchorBeforeFocus =
			anchor.row < focus.row ||
			(anchor.row === focus.row && anchor.col <= focus.col);
		const start = anchorBeforeFocus ? anchor : focus;
		const end = anchorBeforeFocus ? focus : anchor;
		const hasRange = start.row !== end.row || start.col < end.col;
		if (hasRange) {
			copyToClipboard(self, extractSelectionText(self, start, end));
		}
	}

	// Unfroze: render once to show any content that accumulated during the drag.
	self.requestImmediateRender();
}

function handleMouse(self: NexusMainScreen, data: string): MouseResult {
	// If the window loses focus mid-drag, the button release will not arrive; abort the
	// selection so the render loop does not stay frozen.
	if (data === FOCUS_OUT) {
		self._nexusLeftPressed = false;
		self._nexusSelActive = false;
		self._nexusSelAnchor = undefined;
		self._nexusSelFocus = undefined;
		self.requestImmediateRender();
		return { consume: true };
	}
	if (data === FOCUS_IN) {
		return { consume: true };
	}
	const match = SGR_MOUSE_RE.exec(data);
	if (!match) {
		return undefined;
	}
	const button = Number.parseInt(match[1], 10);
	const x = Number.parseInt(match[2], 10) - 1;
	const y = Number.parseInt(match[3], 10) - 1;
	const release = match[4] === "m";
	// Bits 0-2 encode the button: 0 = left. Bit 6 (64) marks a wheel event.
	// We do not request ?1004h explicitly, but many terminals (iTerm2,
	// Terminal.app, etc.) still encode wheel gestures as SGR sequences when
	// any mouse mode is active. Rather than consuming them and breaking native
	// scrollback, pass wheel events through unmodified so the terminal can
	// handle history scrolling natively.
	if ((button & 64) !== 0) {
		return undefined;
	}
	// All other non-left-button events (right-click, side-buttons, etc.)
	// are consumed so they never reach Pi's input handlers as stray data.
	if ((button & 3) !== 0) {
		return { consume: true };
	}
	const point = toContentPoint(self, x, y);
	if (release) {
		finalizeSelection(self, point);
		return { consume: true };
	}
	if ((button & 32) === 0) {
		beginPress(self, point);
		return { consume: true };
	}
	continueDrag(self, point);
	return { consume: true };
}

/**
 * Raw string index to insert at for a visible column `c`.
 *
 * Walks the line the same way the package's own column helpers do (skipping ANSI
 * codes, grouping into graphemes, using visible width per grapheme) and returns the
 * raw offset of the grapheme that covers column `c`. Inserting zero-width SGR at
 * this offset never changes a line's visible width.
 */
function rawIndexAtVisibleColumn(line: string, c: number): number {
	if (c <= 0) {
		// Insert before the first visible grapheme (after any leading ANSI).
		let i = 0;
		while (i < line.length) {
			const ansi = extractAnsiCode(line, i);
			if (ansi) {
				i += ansi.length;
				continue;
			}
			return i;
		}
		return line.length;
	}
	const segmenter = getGraphemeSegmenter();
	let i = 0;
	let col = 0;
	while (i < line.length) {
		const ansi = extractAnsiCode(line, i);
		if (ansi) {
			i += ansi.length;
			continue;
		}
		let textEnd = i;
		while (textEnd < line.length && !extractAnsiCode(line, textEnd)) {
			textEnd++;
		}
		const run = line.slice(i, textEnd);
		for (const seg of segmenter.segment(run)) {
			const w = visibleWidth(seg.segment);
			if (col + w > c) {
				return i + seg.index;
			}
			col += w;
		}
		i = textEnd;
	}
	return line.length;
}

/** Wrap the visible column range [cStart, cEnd) in reverse video, preserving width. */
function highlightLine(line: string, cStart: number, cEnd: number): string {
	if (cEnd <= cStart) {
		return line;
	}
	const onIdx = rawIndexAtVisibleColumn(line, cStart);
	const offIdx = rawIndexAtVisibleColumn(line, cEnd);
	if (offIdx <= onIdx) {
		return line;
	}
	return (
		line.slice(0, onIdx) +
		REVERSE_ON +
		line.slice(onIdx, offIdx) +
		REVERSE_OFF +
		line.slice(offIdx)
	);
}

/**
 * Return a copy of the rendered content lines with reverse video applied to the
 * active selection. This is baked into `render()` output so the normal
 * differential render paints (and repaints) the highlight, keeping the screen
 * live while a drag is in progress.
 */
function paintSelection(self: NexusMainScreen, lines: string[]): string[] {
	const anchor = self._nexusSelAnchor;
	const focus = self._nexusSelFocus;
	if (!anchor || !focus) {
		return lines;
	}
	const anchorBeforeFocus =
		anchor.row < focus.row || (anchor.row === focus.row && anchor.col <= focus.col);
	const start = anchorBeforeFocus ? anchor : focus;
	const end = anchorBeforeFocus ? focus : anchor;
	if (start.row >= lines.length) {
		return lines;
	}
	const out = lines.slice();
	for (let r = start.row; r <= end.row && r < out.length; r++) {
		const line = out[r];
		const colStart = r === start.row ? start.col : 0;
		const colEnd = r === end.row ? end.col : visibleWidth(line);
		if (colEnd > colStart) {
			out[r] = highlightLine(line, colStart, colEnd);
		}
	}
	return out;
}

/**
 * Gives the regular (main-screen) TUI its own mouse text selection.
 *
 * During inference the main screen is rewritten constantly (spinner, streaming
 * tokens, timers). That rewrites lines under the terminal's native selection and
 * cancels it. This patch makes the TUI own selection instead: it enables SGR
 * mouse reporting, tracks a content-anchored selection, freezes the render loop
 * while a drag is in progress (so nothing refreshes underneath it), and copies
 * the selection to the clipboard on release.
 */
export function applyMainScreenSelectionPatch(): void {
	if (mainScreenSelectionPatchApplied) {
		return;
	}

	const proto = TuiMainScreen.prototype as unknown as NexusMainScreen;

	// Bake the selection highlight into the rendered lines every frame, so the normal
	// differential render paints and repaints it. The screen stays live during a drag
	// (no freeze) while the highlighted range is still visible on top of the content.
	const originalRender = proto.render;
	proto.render = function renderWithSelectionHighlight(
		this: NexusMainScreen,
		width: number,
	): string[] {
		const lines = originalRender.call(this, width);
		return this._nexusSelActive ? paintSelection(this, lines) : lines;
	};

	const originalBeforeTerminalStart = proto.beforeTerminalStart;
	proto.beforeTerminalStart = function beforeTerminalStartWithMouse(
		this: NexusMainScreen,
	): void {
		const self = this;
		self.terminal.write(ENABLE_MOUSE);
		if (!self._nexusMouseInstalled) {
			self._nexusMouseInstalled = true;
			// Capture the concrete instance so the listener always targets the right TUI.
			self.addInputListener((data: string) => handleMouse(self, data));
		}
		originalBeforeTerminalStart?.call(this);
	};

	const originalBeforeTerminalStop = proto.beforeTerminalStop;
	proto.beforeTerminalStop = function beforeTerminalStopWithMouse(
		this: NexusMainScreen,
		options?: unknown,
	): void {
		const self = this;
		self._nexusLeftPressed = false;
		self._nexusSelActive = false;
		self._nexusSelAnchor = undefined;
		self._nexusSelFocus = undefined;
		if (self._nexusMouseInstalled) {
			self.terminal.write(DISABLE_MOUSE);
		}
		originalBeforeTerminalStop?.call(this, options);
	};

	mainScreenSelectionPatchApplied = true;
}
