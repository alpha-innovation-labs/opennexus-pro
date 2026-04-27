import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { MdEditorModal } from "../../../packages/extensions/src/md-editor/modal/MdEditorModal.js";
import type { MarkdownFileSnapshot } from "../../../packages/extensions/src/md-editor/file/computeMarkdownFileSnapshot.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("editor_stream_escape_ctrl_c_focus", async () => {
	const dir = await mkdtemp(path.join(os.tmpdir(), "md-keys-"));
	let closed = false;
	const snapshot: MarkdownFileSnapshot = { filePath: path.join(dir, "demo.md"), content: "A", lines: ["A"], mtimeMs: 1, contentHash: "a" };
	try {
		const ctx = { ui: { theme: createTestTheme() }, sessionManager: { getSessionDir: () => dir }, model: { provider: "p", id: "m" } } as any;
		const modal = new MdEditorModal(ctx, snapshot, new Map(), () => { closed = true; }, () => undefined, { selectedLineNumber: 1, focus: "left-panel" });
		modal.handleInput("\r");
		modal.handleInput("\u0003");
		assert.match(modal.render(100).join("\n"), /● demo.md/);
		modal.handleInput("\u0003");
		assert.equal(closed, true);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});
