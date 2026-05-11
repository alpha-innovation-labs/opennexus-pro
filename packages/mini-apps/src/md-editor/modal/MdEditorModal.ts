import { Container, Key, matchesKey, truncateToWidth } from "@earendil-works/pi-tui";
import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import type { MarkdownFileSnapshot } from "../file/computeMarkdownFileSnapshot.js";
import { sendLineChatMessage } from "../chat/sendLineChatMessage.js";
import { renderLineChat } from "../chat/renderLineChat.js";
import { createInitialLineChatSession } from "../line-chat/createInitialLineChatSession.js";
import type { LineChatSession } from "../line-chat/types.js";
import { writeMdEditorState } from "../state/writeMdEditorState.js";
import { buildLeftPanelLines } from "./buildLeftPanelLines.js";
import { padVisibleEnd } from "./padVisibleEnd.js";

/**
 * Two-pane Markdown editor modal for line navigation and per-line chat.
 */
export class MdEditorModal extends Container {
	focused = true;
	private acceptedBaselineContent: string;
	private focus: "left-panel" | "right-chat";
	private input = "";
	private selectedLineNumber: number;
	private workingLine: number | undefined;

	constructor(
		private readonly ctx: ExtensionCommandContext,
		private snapshot: MarkdownFileSnapshot,
		private readonly sessions: Map<number, LineChatSession>,
		private readonly done: () => void,
		private readonly requestRender: () => void,
		initial: { selectedLineNumber: number; focus: "left-panel" | "right-chat" },
	) {
		super();
		this.acceptedBaselineContent = snapshot.content;
		this.selectedLineNumber = Math.max(1, Math.min(snapshot.lines.length, initial.selectedLineNumber));
		this.focus = initial.focus;
	}

	/** Updates the visible file snapshot after a live reload. */
	setSnapshot(snapshot: MarkdownFileSnapshot): void {
		this.snapshot = snapshot;
		this.selectedLineNumber = Math.max(1, Math.min(snapshot.lines.length, this.selectedLineNumber));
		this.invalidate();
		this.requestRender();
	}

	/** Handles keyboard input for the currently focused pane. */
	handleInput(data: string): void {
		if (this.focus === "right-chat") {
			this.handleChatInput(data);
			return;
		}
		this.handleLeftInput(data);
	}

	/** Clears cached render state; this component renders directly from live state. */
	invalidate(): void {}

	/** Renders the framed two-pane editor modal. */
	render(width: number): string[] {
		const terminalRows = process.stdout.rows ?? 30;
		const terminalColumns = process.stdout.columns ?? width;
		const innerWidth = Math.max(20, Math.min(width, terminalColumns) - 2);
		const leftWidth = Math.max(28, Math.floor((innerWidth - 1) * (this.focus === "left-panel" ? 0.58 : 0.35)));
		const rightWidth = Math.max(20, innerWidth - leftWidth - 1);
		const bodyHeight = Math.max(1, terminalRows - 2);
		const left = buildLeftPanelLines(this.snapshot, this.selectedLineNumber, new Set(this.sessions.keys()), leftWidth, this.ctx.ui.theme, this.acceptedBaselineContent);
		const statusLines = this.workingLine === this.selectedLineNumber ? [this.ctx.ui.theme.fg("muted", "Working...")] : [];
		const right = renderLineChat(this.sessions.get(this.selectedLineNumber), this.input, rightWidth, this.ctx.ui.theme, statusLines);
		const visibleRight = this.focus === "right-chat" ? right.slice(Math.max(0, right.length - bodyHeight)) : right.slice(0, bodyHeight);
		const start = Math.max(0, Math.min(this.selectedLineNumber - Math.floor(bodyHeight / 2), Math.max(0, left.length - bodyHeight)));
		const lines = [this.borderTop(innerWidth, leftWidth, rightWidth)];
		for (let row = 0; row < bodyHeight; row += 1) lines.push(this.row(left[start + row] ?? "", visibleRight[row] ?? "", leftWidth, rightWidth));
		lines.push(`└${"─".repeat(innerWidth)}┘`);
		return lines;
	}

	/** Handles read-only left-panel navigation and modal shortcuts. */
	private handleLeftInput(data: string): void {
		if (matchesKey(data, Key.ctrl("c"))) return this.done();
		if (matchesKey(data, Key.ctrl("a"))) {
			this.acceptedBaselineContent = this.snapshot.content;
			return;
		}
		if (matchesKey(data, Key.enter)) {
			this.focus = "right-chat";
			void this.saveState();
			return;
		}
		if (data === "j" || matchesKey(data, Key.down)) this.moveSelection(1);
		if (data === "k" || matchesKey(data, Key.up)) this.moveSelection(-1);
		if (data === "G") this.selectedLineNumber = this.snapshot.lines.length;
		if (data === "g") this.selectedLineNumber = 1;
		void this.saveState();
	}

	/** Handles right-panel chat input editing and focus shortcuts. */
	private handleChatInput(data: string): void {
		if (matchesKey(data, Key.ctrl("c"))) {
			this.focus = "left-panel";
			void this.saveState();
			return;
		}
		if (matchesKey(data, Key.backspace)) this.input = this.input.slice(0, -1);
		else if (matchesKey(data, Key.enter)) void this.submitChat();
		else if (!matchesKey(data, Key.escape) && data >= " " && data !== "\x7f") this.input += data;
		this.requestRender();
	}

	/** Saves a non-empty chat input as a per-line conversation turn. */
	private async submitChat(): Promise<void> {
		const content = this.input.trim();
		if (!content) return;
		this.input = "";
		this.workingLine = this.selectedLineNumber;
		this.requestRender();
		const session = this.sessions.get(this.selectedLineNumber) ?? createInitialLineChatSession(this.snapshot, this.selectedLineNumber);
		try {
			const result = await sendLineChatMessage(this.ctx, this.snapshot, session, content, {
				onUpdate: (liveSession) => {
					this.sessions.set(this.selectedLineNumber, liveSession);
					this.requestRender();
				},
			});
			this.snapshot = result.snapshot;
			this.sessions.set(this.selectedLineNumber, result.session);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			this.sessions.set(this.selectedLineNumber, { ...session, messages: [...session.messages, { role: "user", content, timestamp: new Date().toISOString() }, { role: "assistant", content: `Line chat failed: ${message}`, timestamp: new Date().toISOString() }] });
		}
		this.workingLine = undefined;
		this.requestRender();
	}

	/** Moves the selected source line within file bounds. */
	private moveSelection(delta: number): void {
		this.selectedLineNumber = Math.max(1, Math.min(this.snapshot.lines.length, this.selectedLineNumber + delta));
	}

	/** Persists current editor focus and line state. */
	private async saveState(): Promise<void> {
		await writeMdEditorState(this.ctx.sessionManager.getSessionDir(), { selectedLineNumber: this.selectedLineNumber, focus: this.focus });
	}

	/** Renders the modal top border and focused pane titles. */
	private borderTop(width: number, leftWidth: number, rightWidth: number): string {
		const leftTitle = `${this.focus === "left-panel" ? "●" : "○"} demo.md`;
		const rightTitle = `${this.focus === "right-chat" ? "●" : "○"} line ${this.selectedLineNumber} chat`;
		return `┌${this.titleCell(leftTitle, leftWidth)}┬${this.titleCell(rightTitle, rightWidth)}┐`;
	}

	/** Renders one title cell without corrupting title spacing. */
	private titleCell(title: string, width: number): string {
		const value = truncateToWidth(`─ ${title} `, width);
		return `${value}${"─".repeat(Math.max(0, width - [...value].length))}`;
	}

	/** Renders one split-pane body row. */
	private row(left: string, right: string, leftWidth: number, rightWidth: number): string {
		return `│${padVisibleEnd(left, leftWidth)}│${padVisibleEnd(right, rightWidth)}│`;
	}
}
