import assert from "node:assert/strict";
import test from "node:test";
import { MemoryModal } from "../../../packages/extensions/src/memory/modal/MemoryModal.js";
import type { MemoryItem } from "../../../packages/extensions/src/memory/types/MemoryItem.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

const items: MemoryItem[] = [
	{
		label: "nexus/packages/ai-sdk/cursor-sdk/reference/raw/cursor-sdk-announcement",
		path: "/memory/nexus/packages/ai-sdk/cursor-sdk/reference/raw/cursor-sdk-announcement.md",
		relativePath: "nexus/packages/ai-sdk/cursor-sdk/reference/raw/cursor-sdk-announcement.md",
		content: "Raw Cursor SDK tweet",
	},
	{
		label: "nexus/packages/ai-sdk/cursor-sdk/reference/references",
		path: "/memory/nexus/packages/ai-sdk/cursor-sdk/reference/references.md",
		relativePath: "nexus/packages/ai-sdk/cursor-sdk/reference/references.md",
		content: "## References\n\n- cursor-sdk-announcement-distilled.md: SDK note",
	},
	{
		label: "nexus/packages/ai-sdk/cursor-sdk/reference/cursor-sdk-announcement-distilled",
		path: "/memory/nexus/packages/ai-sdk/cursor-sdk/reference/cursor-sdk-announcement-distilled.md",
		relativePath: "nexus/packages/ai-sdk/cursor-sdk/reference/cursor-sdk-announcement-distilled.md",
		content: "## Cursor SDK announcement",
	},
	{
		label: "nexus/nexus",
		path: "/memory/nexus/nexus.md",
		relativePath: "nexus/nexus.md",
		content: "## Nexus",
	},
];

test("/memory modal renders project root before nested files as a file-only tree", async () => {
	const viewport = await renderComponentInVirtualTerminal(() => new MemoryModal(createTestTheme(), items, () => {}, async () => undefined), 120, 34);
	const output = viewport.join("\n");
	const rootIndex = output.indexOf(" nexus");
	const referenceIndex = output.indexOf("└─  references");
	const nestedIndex = output.indexOf("├─  cursor-sdk-announcement-distilled");
	const rawIndex = output.indexOf("└─ 󰯊 cursor-sdk-announcement");

	assert.ok(rootIndex >= 0, output);
	assert.ok(referenceIndex > rootIndex, output);
	assert.ok(nestedIndex > referenceIndex, output);
	assert.ok(rawIndex > nestedIndex, output);
	assert.match(output, /\/memory\/nexus\/nexus\.md/u);
	assert.doesNotMatch(output, / file /u);
	assert.doesNotMatch(output, //u);
});

test("/memory modal d deletes the selected memory item", () => {
	const deleted: string[] = [];
	const modal = new MemoryModal(createTestTheme(), items, () => {}, async (item) => {
		deleted.push(item.relativePath);
	});

	modal.handleInput("d");
	const output = modal.render(100).join("\n");

	assert.deepEqual(deleted, ["nexus/nexus.md"]);
	assert.doesNotMatch(output, / nexus\s/u);
	assert.match(output, /cursor-sdk-announcement-dis/u);
});
