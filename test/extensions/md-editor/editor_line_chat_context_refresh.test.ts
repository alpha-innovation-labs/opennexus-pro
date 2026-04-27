import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { createLineChatPrompt } from "../../../src/extensions/md-editor/chat/createLineChatPrompt.js";
import type { MarkdownFileSnapshot } from "../../../src/extensions/md-editor/file/computeMarkdownFileSnapshot.js";

test("editor_line_chat_context_refresh", () => {
	const snapshot: MarkdownFileSnapshot = { filePath: path.join(process.cwd(), "demo.md"), content: "one\ntwo", lines: ["one", "two"], mtimeMs: 2, contentHash: "two" };
	const prompt = createLineChatPrompt(snapshot, 2, "question");
	assert.match(prompt, /Selected line number: 2/);
	assert.match(prompt, /Selected line text: two/);
	assert.match(prompt, /Full file content:\none\ntwo/);
	assert.match(prompt, /update the file with the edit tool/);
});
