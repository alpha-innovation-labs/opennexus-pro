import { Container, Key, matchesKey, truncateToWidth, visibleWidth, type Focusable, type TUI } from "@mariozechner/pi-tui";
import { ExtensionEditorComponent } from "@mariozechner/pi-coding-agent";
import { renderPaneColumn } from "./renderPaneColumn.js";
import { renderPlaygroundInput } from "./renderPlaygroundInput.js";

/**
 * Overlay modal for the split playground child Pi conversations.
 */
export class PlaygroundModal extends Container implements Focusable {
	private focusedState = false;
	private scrollOffset = 0;
	private lastPaneWidth = 40;
	private readonly input: ExtensionEditorComponent;

	/**
	 * Creates the playground modal.
	 *
	 * @param tui Active TUI instance.
	 * @param theme Active Pi theme.
	 * @param keybindings Active keybindings manager.
	 * @param getPanes Returns both pane transcripts.
	 * @param getStatus Returns combined status text.
	 * @param onSubmit Sends one message to both child conversations.
	 * @param onClose Closes the modal.
	 */
	constructor(
		private readonly tui: TUI,
		private readonly theme: any,
		private readonly keybindings: any,
		private readonly getPanes: (width: number) => Array<{ key: string; title: string; status: string; busy: boolean; lines: string[] }>,
		private readonly getStatus: () => string,
		private readonly onSubmit: (value: string) => void,
		private readonly onClose: () => void,
	) {
		super();
		this.input = new ExtensionEditorComponent(tui, keybindings, "Playground", "", (value) => this.onSubmit(value), () => this.onClose());
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
		this.input.focused = value;
	}

	/**
	 * Handles scrolling, submission, and close keys.
	 *
	 * @param data Raw input sequence.
	 */
	handleInput(data: string): void {
		if (this.keybindings.matches(data, "selectCancel") || matchesKey(data, Key.escape)) {
			this.onClose();
			return;
		}
		if (matchesKey(data, Key.pageUp)) {
			this.adjustScroll(8);
			return;
		}
		if (matchesKey(data, Key.pageDown)) {
			this.adjustScroll(-8);
			return;
		}
		this.input.handleInput(data);
		this.tui.requestRender();
	}

	/**
	 * Declares that the modal has no cached off-screen render state.
	 */
	invalidate(): void {}

	/**
	 * Renders the modal frame, split panes, and Neo-style input.
	 *
	 * @param width Available overlay width.
	 * @returns Rendered modal lines.
	 */
	render(width: number): string[] {
		const dialogWidth = Math.max(96, Math.min(width, Math.floor(width * 0.94)));
		const innerWidth = Math.max(70, dialogWidth - 2);
		const separator = this.theme.fg("borderMuted", " │ ");
		const separatorWidth = visibleWidth(separator);
		const paneWidth = Math.max(30, Math.floor((innerWidth - separatorWidth) / 2));
		const bodyHeight = Math.max(10, Math.floor((this.tui.terminal.rows ?? 40) * 0.6) - 6);
		this.lastPaneWidth = paneWidth;
		const panes = this.getPanes(paneWidth);
		const maxScroll = Math.max(0, ...panes.map((pane) => Math.max(0, pane.lines.length - bodyHeight)));
		this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset));
		const renderedPanes = panes.map((pane) => renderPaneColumn(pane, this.theme, paneWidth, bodyHeight, this.scrollOffset));
		const paneRows = Math.max(...renderedPanes.map((pane) => pane.length));
		for (const pane of renderedPanes) {
			while (pane.length < paneRows) pane.push(" ".repeat(paneWidth));
		}
		const inputLines = renderPlaygroundInput(this.input, this.theme, innerWidth, this.getStatus());
		const rows = [
			this.borderLine(innerWidth, "top"),
			this.frameLine(this.theme.fg("accent", this.theme.bold(" Playground ")), innerWidth),
			this.frameLine(this.theme.fg("dim", "Esc closes · PgUp/PgDn scroll · Enter sends to both panes"), innerWidth),
			this.theme.fg("borderMuted", `├${"─".repeat(innerWidth)}┤`),
			...Array.from({ length: paneRows }, (_, index) => this.frameLine(`${renderedPanes[0]?.[index] ?? ""}${separator}${renderedPanes[1]?.[index] ?? ""}`, innerWidth)),
			this.theme.fg("borderMuted", `├${"─".repeat(innerWidth)}┤`),
			...inputLines,
			this.borderLine(innerWidth, "bottom"),
		];
		return rows.map((line) => truncateToWidth(line, dialogWidth, ""));
	}

	/**
	 * Adjusts the shared pane scroll offset.
	 *
	 * @param delta Positive scrolls up, negative scrolls down.
	 */
	scrollBy(delta: number): void {
		this.adjustScroll(delta);
	}

	/**
	 * Adjusts the shared pane scroll offset.
	 *
	 * @param delta Positive scrolls up, negative scrolls down.
	 */
	private adjustScroll(delta: number): void {
		const bodyHeight = Math.max(10, Math.floor((this.tui.terminal.rows ?? 40) * 0.6) - 6);
		const panes = this.getPanes(this.lastPaneWidth);
		const maxScroll = Math.max(0, ...panes.map((pane) => Math.max(0, pane.lines.length - bodyHeight)));
		this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset + delta));
		this.tui.requestRender();
	}

	/**
	 * Wraps one content line inside the modal frame.
	 *
	 * @param content Inner content.
	 * @param innerWidth Usable content width.
	 * @returns Framed content line.
	 */
	private frameLine(content: string, innerWidth: number): string {
		const truncated = truncateToWidth(content, innerWidth, "");
		const pad = Math.max(0, innerWidth - visibleWidth(truncated));
		return `${this.theme.fg("borderMuted", "│")}${truncated}${" ".repeat(pad)}${this.theme.fg("borderMuted", "│")}`;
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
}
