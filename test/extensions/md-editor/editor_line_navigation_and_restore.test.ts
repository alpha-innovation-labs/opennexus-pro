import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { MdEditorModal } from "../../../packages/extensions/src/md-editor/modal/MdEditorModal.js";
import type { MarkdownFileSnapshot } from "../../../packages/extensions/src/md-editor/file/computeMarkdownFileSnapshot.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

function ctx(dir: string): any {
	return { ui: { theme: createTestTheme() }, sessionManager: { getSessionDir: () => dir }, model: { provider: "test", id: "model" } };
}

test("editor_line_navigation_and_restore", async () => {
	const dir = await mkdtemp(path.join(os.tmpdir(), "md-editor-state-"));
	const snapshot: MarkdownFileSnapshot = { filePath: path.join(dir, "demo.md"), content: "# A\nB\nC", lines: ["# A", "B", "C"], mtimeMs: 1, contentHash: "a" };
	try {
		const modal = new MdEditorModal(ctx(dir), snapshot, new Map(), () => undefined, () => undefined, { selectedLineNumber: 1, focus: "left-panel" });
		modal.handleInput("j");
		modal.handleInput("\r");
		const output = modal.render(100).join("\n");
		assert.match(output, /line 2 chat/);
		assert.match(output, /▶ 2/);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});
