import assert from "node:assert/strict";
import test from "node:test";
import { SubagentHistoryModal } from "../../../packages/extension-core/src/sub-agents/ui/SubagentHistoryModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

function createRun(id: string, title: string) {
	return {
		id,
		title,
		prompt: title,
		cwd: "/tmp/project",
		subagentType: "general-purpose",
		status: "completed",
		background: false,
		createdAt: Number(id.replace(/\D/g, "")) || 0,
		resultText: "",
		liveAssistantText: "",
		liveThinkingText: "",
		activeTool: null,
		transcript: [{ role: "assistant", text: title, createdAt: 1 }],
		client: null,
		toolCalls: 0,
		contextProviderIds: [],
	} as never;
}

test("subagent history modal uses wider left pane when list is focused", async () => {
	process.env.PI_PACKAGE_DIR = `${process.cwd()}/node_modules/@earendil-works/pi-coding-agent`;
	await initializePiThemes();
	const modal = new SubagentHistoryModal(
		createTestTheme() as never,
		[createRun("1", "First run")],
		() => undefined,
	);

	const leftFocused = await renderComponentInVirtualTerminal(() => modal, 120, 30);
	modal.handleInput("\r");
	const rightFocused = await renderComponentInVirtualTerminal(() => modal, 120, 30);

	const leftHeader = leftFocused.find((line) => line.includes("● Agents")) ?? "";
	const rightHeader = rightFocused.find((line) => line.includes("○ Agents")) ?? "";
	const leftDivider = leftHeader.indexOf("┬");
	const rightDivider = rightHeader.indexOf("┬");

	assert.equal(leftDivider > rightDivider, true);
});
