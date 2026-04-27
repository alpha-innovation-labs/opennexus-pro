import assert from "node:assert/strict";
import test from "node:test";
import { SubagentHistoryModal } from "../../../packages/extensions/src/sub-agents/ui/SubagentHistoryModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

test("subagent history modal focuses transcript on enter and returns to list on escape", async () => {
	process.env.PI_PACKAGE_DIR = `${process.cwd()}/node_modules/@mariozechner/pi-coding-agent`;
	await initializePiThemes();
	const run = {
		id: "run-1",
		title: "Bug",
		prompt: "review bug",
		cwd: "/tmp/project",
		subagentType: "gp",
		status: "completed",
		background: false,
		createdAt: 1,
		resultText: "",
		liveAssistantText: "",
		liveThinkingText: "",
		activeTool: null,
		transcript: [
			{ role: "user", text: "prompt", createdAt: 1 },
			{ role: "assistant", text: "# Heading\n\n- item", createdAt: 2 },
		],
		client: null,
		toolCalls: 0,
		contextProviderIds: [],
	} as never;

	let doneCalls = 0;
	const modal = new SubagentHistoryModal(createTestTheme() as never, [run], () => {
		doneCalls += 1;
	});
	const listView = await renderComponentInVirtualTerminal(() => modal, 200, 30);
	assert.match(listView.join("\n"), /completed · gp · \//);
	modal.handleInput("\r");
	const transcriptFocused = await renderComponentInVirtualTerminal(() => modal, 120, 30);
	assert.match(transcriptFocused.join("\n"), /● Transcript/);
	modal.handleInput("j");
	modal.handleInput("\x1b");
	const listFocused = await renderComponentInVirtualTerminal(() => modal, 120, 30);
	assert.match(listFocused.join("\n"), /● Agents/);
	modal.handleInput("\x1b");
	assert.equal(doneCalls, 1);
});
