import assert from "node:assert/strict";
import test from "node:test";
import { MemoryModal } from "../../../packages/mini-apps/src/memory/modal/MemoryModal.js";
import type { MemoryItem } from "../../../packages/mini-apps/src/memory/types/MemoryItem.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

const items: MemoryItem[] = [
	{ label: "nexus/references/cursor-sdk", path: "/memory/nexus/references/cursor-sdk.md", relativePath: "nexus/references/cursor-sdk.md", content: "Raw Cursor SDK tweet" },
	{ label: "nexus/marketing", path: "/memory/nexus/marketing.md", relativePath: "nexus/marketing.md", content: "- cursor-sdk.md: Try a Cursor SDK launch post." },
];

test("/memory modal renders topics and collapsed references per project", async () => {
	const viewport = await renderComponentInVirtualTerminal(() => new MemoryModal(createTestTheme(), items, () => {}, async () => undefined), 120, 34);
	const output = viewport.join("\n");
	const projectIndex = output.indexOf(" nexus");
	const topicIndex = output.indexOf("├─  marketing");
	const referencesIndex = output.indexOf("└─  references");

	assert.ok(projectIndex >= 0, output);
	assert.ok(topicIndex > projectIndex, output);
	assert.ok(referencesIndex > topicIndex, output);
	assert.doesNotMatch(output, /cursor-sdk\s/u);
});

test("/memory modal expands references and d deletes selected topic", () => {
	const deleted: string[] = [];
	const modal = new MemoryModal(createTestTheme(), items, () => {}, async (item) => {
		deleted.push(item.relativePath);
	});

	modal.handleInput("j");
	modal.handleInput("d");
	modal.handleInput("j");
	modal.handleInput("\r");
	const output = modal.render(120).join("\n");

	assert.deepEqual(deleted, ["nexus/marketing.md"]);
	assert.doesNotMatch(output, /marketing/u);
	assert.match(output, /└─ 󰯊 cursor-sdk/u);
});
