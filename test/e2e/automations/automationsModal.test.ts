import assert from "node:assert/strict";
import test from "node:test";
import { AutomationEditorModal } from "../../../packages/mini-apps/src/automations/modal/AutomationEditorModal.js";
import { AutomationPickerModal } from "../../../packages/mini-apps/src/automations/modal/AutomationPickerModal.js";
import type { AutomationRecord, AutomationRunRecord } from "../../../packages/mini-apps/src/automations/core/storage/types.js";
import type { AutomationChatSender } from "../../../packages/mini-apps/src/automations/modal/types.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

const automation: AutomationRecord = {
	id: "auto-1",
	name: "daily monitor",
	scheduleText: "daily",
	cronExpression: "0 9 * * *",
	prompt: "Check project health",
	cwd: "/repo",
	enabled: true,
	createdAt: "2026-05-11T00:00:00.000Z",
	updatedAt: "2026-05-11T00:00:00.000Z",
	nextRunAt: "2026-05-12T09:00:00.000Z",
};

const latestRuns: AutomationRunRecord[] = [
	{ id: "run-2", automationId: "auto-1", status: "failed", startedAt: "2026-05-11T08:00:00.000Z", finishedAt: "2026-05-11T08:01:00.000Z", exitCode: 1, pid: 123, sessionPath: null, logPath: "/logs/run-2.log", error: "model unavailable" },
	{ id: "run-1", automationId: "auto-1", status: "success", startedAt: "2026-05-10T08:00:00.000Z", finishedAt: "2026-05-10T08:02:00.000Z", exitCode: 0, pid: 122, sessionPath: null, logPath: "/logs/run-1.log", error: null },
];

/** Flushes pending promise callbacks for modal chat updates. */
async function flushPromises(): Promise<void> {
	await new Promise((resolve) => setImmediate(resolve));
}

test("/automations picker shows current automations and opens selected item", async () => {
	let selected: AutomationRecord | undefined;
	const picker = new AutomationPickerModal(createTestTheme(), [automation], (item) => { selected = item; }, () => {}, () => latestRuns);
	const viewport = await renderComponentInVirtualTerminal(() => picker, 120, 34);
	const output = viewport.join("\n");

	assert.match(output, /Schedule: daily/u);
	assert.match(output, /Check project health/u);
	assert.match(output, /Last run 1: failed .* 2026-05-11 08:00 .* 08:01/u);
	assert.match(output, /exit=1 .* log=run-2.log .* err=model unavailable/u);
	assert.match(output, /Last run 2: success .* 2026-05-10 08:00 .* 08:02/u);
	assert.match(output, /exit=0 .* log=run-1.log .* err=none/u);
	picker.handleInput("\r");
	assert.equal(selected?.id, automation.id);
});

test("/automations editor updates left pane after agent chat changes automation", async () => {
	const sender: AutomationChatSender = async (_record, messages) => ({
		automation: { ...automation, scheduleText: "every 4h", cronExpression: "0 */4 * * *", prompt: "Check project health every four hours" },
		messages: [...messages, { role: "assistant", content: "Updated schedule and prompt.", createdAt: "2026-05-11T00:00:01.000Z" }],
	});
	const editor = new AutomationEditorModal(automation, sender, () => {}, () => {}, () => latestRuns);
	for (const char of "Run this every 4h") editor.handleInput(char);
	editor.handleInput("\r");
	await flushPromises();
	const output = editor.render(120).join("\n");

	assert.match(output, /Schedule: every 4h/u);
	assert.match(output, /Check project health every four hours/u);
	assert.match(output, /Updated schedule and prompt/u);
	assert.match(output, /Last run 1: failed .* 2026-05-11 08:00 .* 08:01/u);
	assert.match(output, /exit=1 .* log=run-2.log .* err=model unavailable/u);
	assert.match(output, /Last run 2: success .* 2026-05-10 08:00 .* 08:02/u);
	assert.match(output, /exit=0 .* log=run-1.log .* err=none/u);
});
