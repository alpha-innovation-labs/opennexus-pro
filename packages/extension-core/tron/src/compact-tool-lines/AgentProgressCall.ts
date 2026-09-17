import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { hasToolCallFrameState } from "../activity/hasToolCallFrameState";
import { shouldBridgeThinkingToTool } from "../activity/shouldBridgeThinkingToTool";
import { shouldShowToolCallTopBorder } from "../activity/shouldShowToolCallTopBorder";
import type { EntryRenderer } from "../transcript/types";

export function isAgentProgressTool(name: string): boolean {
	return name === "Agent" || name === "SubagentWorkflow";
}

/** Keeps the semantic call header inside Tron's shared frame, never a group count. */
export class AgentProgressCall {
	constructor(
		private readonly toolCallId: string,
		private readonly child: EntryRenderer,
		private readonly theme: Theme,
	) {}

	render(width: number): string[] {
		const innerWidth = Math.max(1, width - 2);
		const lines = this.child.render(innerWidth).map((line) => {
			const text = truncateToWidth(line, innerWidth);
			return this.theme.fg("borderMuted", "│") + text +
				" ".repeat(Math.max(0, innerWidth - visibleWidth(text))) + this.theme.fg("borderMuted", "│");
		});
		if (!shouldBridgeThinkingToTool(this.toolCallId) &&
			(!hasToolCallFrameState(this.toolCallId) || shouldShowToolCallTopBorder(this.toolCallId))) {
			lines.unshift(this.theme.fg("borderMuted", `┌${"─".repeat(innerWidth)}┐`));
		}
		return lines;
	}

	invalidate(): void { this.child.invalidate?.(); }
}
