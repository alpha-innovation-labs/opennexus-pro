import { Container, Key, matchesKey, truncateToWidth, visibleWidth, type Focusable, type TUI } from "@mariozechner/pi-tui";
import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { PtyManager, XtermBuffer } from "../types.js";

/**
 * Floating modal that renders the persistent terminal inside Pi's overlay UI.
 */
export class TerminalModal extends Container implements Focusable {
	private focusedState = false;
	private refresh: (() => void) | null = null;
	private scrollOffset = 0;

	/**
	 * Creates the terminal modal renderer.
	 *
	 * @param tui Active TUI instance.
	 * @param theme Current Pi theme.
	 * @param title Terminal title.
	 * @param xterm Display buffer.
	 * @param pty PTY lifecycle manager.
	 * @param onHide Hide callback for the overlay.
	 */
	constructor(
		private readonly tui: TUI,
		private readonly theme: ExtensionContext["ui"]["theme"],
		private readonly title: string,
		private readonly xterm: XtermBuffer,
		private readonly pty: PtyManager,
		private readonly onHide: () => void,
	) {
		super();
	}

	/**
	 * Returns whether the modal currently owns focus.
	 */
	get focused(): boolean {
		return this.focusedState;
	}

	/**
	 * Updates the modal focus state.
	 */
	set focused(value: boolean) {
		this.focusedState = value;
	}

	/**
	 * Registers the callback used to request repaints.
	 *
	 * @param callback Render request callback.
	 */
	setRefresh(callback: () => void): void {
		this.refresh = callback;
	}

	/**
	 * Handles key input for shell interaction and modal navigation.
	 *
	 * @param data Raw terminal key sequence.
	 */
	handleInput(data: string): void {
		if (matchesKey(data, Key.ctrl("n")) || matchesKey(data, Key.escape)) {
			this.onHide();
			return;
		}
		if (data === "\x11" || matchesKey(data, Key.ctrl("q"))) {
			this.pty.kill();
			this.refresh?.();
			return;
		}
		const maxScroll = Math.max(0, this.xterm.lineCount() - this.getBodyHeight());
		if (data === "\x1b[5~") {
			this.scrollOffset = Math.min(this.scrollOffset + this.getBodyHeight(), maxScroll);
			this.refresh?.();
			return;
		}
		if (data === "\x1b[6~") {
			this.scrollOffset = Math.max(0, this.scrollOffset - this.getBodyHeight());
			this.refresh?.();
			return;
		}
		this.scrollOffset = 0;
		this.xterm.input(data);
		this.refresh?.();
	}

	/**
	 * Renders the terminal modal content.
	 *
	 * @param width Overlay width.
	 * @returns Rendered modal lines.
	 */
	render(width: number): string[] {
		const dialogWidth = Math.max(72, width);
		const innerWidth = Math.max(50, dialogWidth - 2);
		const bodyHeight = this.getBodyHeight();
		this.xterm.resize(innerWidth, bodyHeight);
		this.pty.resize(innerWidth, bodyHeight);
		const totalLines = this.xterm.lineCount();
		const end = totalLines - this.scrollOffset;
		const start = Math.max(0, end - bodyHeight);
		const visible = this.xterm.getDisplayLines(start, end);
		while (visible.length < bodyHeight) visible.unshift("");
		const status = this.pty.isRunning()
			? this.theme.fg("success", "● running") + (this.pty.pid() ? this.theme.fg("dim", ` pid:${this.pty.pid()}`) : "")
			: this.pty.error()
				? this.theme.fg("error", `● ${this.pty.error()}`)
				: this.theme.fg("error", "● stopped");
		const lines = [
			this.borderLine(innerWidth, "top"),
			this.frameLine(` ${this.theme.fg("accent", this.theme.bold(` ${this.title} `))} ${status}`, innerWidth),
			this.frameLine(this.theme.fg("dim", "Ctrl+N or Esc hide · Ctrl+Q kills the terminal · PgUp/PgDn scroll"), innerWidth),
			this.theme.fg("borderMuted", `├${"─".repeat(innerWidth)}┤`),
		];
		for (const line of visible) {
			lines.push(this.frameLine(truncateToWidth(line, innerWidth, ""), innerWidth));
		}
		lines.push(this.theme.fg("borderMuted", `├${"─".repeat(innerWidth)}┤`));
		lines.push(this.frameLine(this.theme.fg("dim", this.scrollLabel(totalLines, bodyHeight)), innerWidth));
		lines.push(this.borderLine(innerWidth, "bottom"));
		return lines;
	}

	/**
	 * Declares that this component does not cache any off-screen state.
	 */
	invalidate(): void {}

	/**
	 * Computes the number of terminal rows available for content.
	 *
	 * @returns Body row count.
	 */
	private getBodyHeight(): number {
		return Math.max(10, Math.floor((this.tui.terminal.rows ?? 40) * 0.85) - 6);
	}

	/**
	 * Wraps one content line inside the modal frame.
	 *
	 * @param content Inner line content.
	 * @param innerWidth Usable content width.
	 * @returns Framed line.
	 */
	private frameLine(content: string, innerWidth: number): string {
		const pad = Math.max(0, innerWidth - visibleWidth(content));
		return `${this.theme.fg("borderMuted", "│")}${content}${" ".repeat(pad)}${this.theme.fg("borderMuted", "│")}`;
	}

	/**
	 * Builds the top or bottom border line.
	 *
	 * @param innerWidth Usable content width.
	 * @param edge Border edge kind.
	 * @returns Border line.
	 */
	private borderLine(innerWidth: number, edge: "top" | "bottom"): string {
		const left = edge === "top" ? "┌" : "└";
		const right = edge === "top" ? "┐" : "┘";
		return this.theme.fg("borderMuted", `${left}${"─".repeat(innerWidth)}${right}`);
	}

	/**
	 * Formats the footer scroll status.
	 *
	 * @param totalLines Total buffered lines.
	 * @param bodyHeight Visible body height.
	 * @returns Footer status text.
	 */
	private scrollLabel(totalLines: number, bodyHeight: number): string {
		if (this.scrollOffset <= 0) {
			return `lines ${Math.max(totalLines - bodyHeight, 0)}-${Math.max(totalLines, 0)} of ${totalLines}`;
		}
		return `scrolled ${this.scrollOffset} lines up · total ${totalLines}`;
	}
}
