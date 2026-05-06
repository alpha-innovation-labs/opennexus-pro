import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { SessionManager } from "@mariozechner/pi-coding-agent";
import { getLineChatSessionPath } from "../../../packages/mini-apps/src/md-editor/line-chat/getLineChatSessionPath.js";

test("editor_line_chat_persistence_hidden_resume", async () => {
	const dir = await mkdtemp(path.join(os.tmpdir(), "sessions-"));
	const filePath = path.join(dir, "demo.md");
	try {
		const sessionPath = await getLineChatSessionPath(dir, filePath, 1);
		const manager = SessionManager.open(sessionPath, dir, dir);
		manager.appendMessage({ role: "user", content: "why", timestamp: Date.now() });
		manager.appendMessage({ role: "assistant", content: [{ type: "text", text: "answer" }], api: "openai-responses", provider: "test", model: "test", usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } }, stopReason: "stop", timestamp: Date.now() } as any);
		const content = await readFile(sessionPath, "utf8");
		assert.match(content, /"type":"session"/);
		assert.match(content, /"role":"user"/);
		assert.ok(sessionPath.includes("md-editor-line-chats"));
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});
