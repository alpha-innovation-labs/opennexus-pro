import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadDemoMarkdownFile } from "../../../packages/mini-apps/src/md-editor/file/loadDemoMarkdownFile.js";
import { registerEditorCommand } from "../../../packages/mini-apps/src/md-editor/command/registerEditorCommand.js";

test("editor_command_opens_demo_md", async () => {
	const cwd = await mkdtemp(path.join(os.tmpdir(), "md-editor-"));
	try {
		const snapshot = await loadDemoMarkdownFile({ cwd });
		assert.equal(snapshot.filePath, path.join(cwd, "demo.md"));
		assert.equal(snapshot.content, "");
		const commands = new Map<string, unknown>();
		registerEditorCommand({ registerCommand: (name: string, definition: unknown) => commands.set(name, definition) } as any);
		assert.ok(commands.has("editor"));
	} finally {
		await rm(cwd, { recursive: true, force: true });
	}
});
