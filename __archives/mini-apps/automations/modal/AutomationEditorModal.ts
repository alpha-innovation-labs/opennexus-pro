import { Container, Key, matchesKey } from "@earendil-works/pi-tui";
import { listLatestRunsForAutomation } from "../core/storage/listLatestRunsForAutomation.js";
import type { AutomationRecord } from "../core/storage/types.js";
import { createAutomationDetailLines } from "./createAutomationDetailLines.js";
import { renderAutomationChat } from "./renderAutomationChat.js";
import { renderAutomationPane } from "./renderAutomationPane.js";
import { renderAutomationTitleCell } from "./renderAutomationTitleCell.js";
import type { AutomationChatMessage, AutomationChatSender, AutomationRunSummaryProvider } from "./types.js";

/** Full-screen two-pane automation editor with right-side agent chat. */
export class AutomationEditorModal extends Container {
	focused = true;
	private focus: "left" | "chat" = "chat";
	private input = "";
	private messages: AutomationChatMessage[] = [];
	private working = false;

	constructor(private automation: AutomationRecord, private readonly sender: AutomationChatSender, private readonly done: () => void, private readonly requestRender: () => void, private readonly getLatestRuns: AutomationRunSummaryProvider = (automationId) => listLatestRunsForAutomation(automationId, 2)) {
		super();
	}

	/** Handles chat typing, submission, pane focus, and close shortcuts. */
	handleInput(data: string): void {
		if (matchesKey(data, Key.ctrl("c")) || matchesKey(data, Key.escape)) return this.done();
		if (data === "\t") { this.focus = this.focus === "chat" ? "left" : "chat"; return this.requestRender(); }
		if (this.focus === "left") { if (matchesKey(data, Key.enter)) this.focus = "chat"; return this.requestRender(); }
		if (this.working) return;
		if (matchesKey(data, Key.backspace)) this.input = this.input.slice(0, -1);
		else if (matchesKey(data, Key.enter)) void this.submitChat();
		else if (data >= " " && data !== "\x7f") this.input += data;
		this.requestRender();
	}

	/** Clears cached render state. */
	invalidate(): void {}

	/** Renders the editor as a full-screen split pane. */
	render(width: number): string[] {
		const terminalRows = process.stdout.rows ?? 30;
		const innerWidth = Math.max(20, width - 2);
		const leftWidth = Math.max(30, Math.floor((innerWidth - 1) * 0.48));
		const rightWidth = Math.max(20, innerWidth - leftWidth - 1);
		const bodyHeight = Math.max(1, terminalRows - 3);
		const left = renderAutomationPane(createAutomationDetailLines(this.automation, this.getLatestRuns(this.automation.id)), leftWidth, bodyHeight, false);
		const right = renderAutomationPane(renderAutomationChat(this.messages, this.input, this.working), rightWidth, bodyHeight, true);
		const rows = [`┌${renderAutomationTitleCell(`${this.focus === "left" ? "●" : "○"} Automation`, leftWidth)}┬${renderAutomationTitleCell(`${this.focus === "chat" ? "●" : "○"} Agent Chat`, rightWidth)}┐`];
		for (let index = 0; index < bodyHeight; index += 1) rows.push(`│${left[index]}│${right[index]}│`);
		rows.push(`└${"─".repeat(innerWidth)}┘`);
		return rows;
	}

	/** Sends the current chat request to the automation editor agent. */
	private async submitChat(): Promise<void> {
		const content = this.input.trim();
		if (!content) return;
		this.input = "";
		this.working = true;
		this.messages = [...this.messages, { role: "user", content, createdAt: new Date().toISOString() }];
		this.requestRender();
		try {
			const result = await this.sender(this.automation, this.messages, content, (messages) => { this.messages = messages; this.requestRender(); });
			this.automation = result.automation;
			this.messages = result.messages;
		} catch (error) {
			this.messages = [...this.messages, { role: "assistant", content: `Automation update failed: ${error instanceof Error ? error.message : String(error)}`, createdAt: new Date().toISOString() }];
		}
		this.working = false;
		this.requestRender();
	}
}
