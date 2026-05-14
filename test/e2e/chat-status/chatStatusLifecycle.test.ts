import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createExtensionRuntime, loadExtensionFromFactory } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js";
import { ExtensionRunner } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/runner.js";
import { createEventBus } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/core/event-bus.js";
import { registerChatStatusExtension } from "../../../packages/extension-core/src/chat-status/registerChatStatusExtension.js";

/**
 * Creates a runner with the chat-status extension registered through Pi's extension runtime.
 *
 * @param sessionFile Test session file path exposed through the session manager.
 * @returns Extension runner configured for lifecycle event emission.
 */
async function createChatStatusRunner(sessionFile: string): Promise<ExtensionRunner> {
  const runtime = createExtensionRuntime();
  const eventBus = createEventBus();
  const extension = await loadExtensionFromFactory(registerChatStatusExtension, process.cwd(), eventBus, runtime, "<chat-status-test>");
  const sessionManager = {
    getSessionId() { return "session-test"; },
    getSessionFile() { return sessionFile; },
    getSessionName() { return "Live coding chat"; },
  };
  const runner = new ExtensionRunner([extension], runtime, process.cwd(), sessionManager as never, {} as never);

  runner.bindCore({
    sendMessage() {}, sendUserMessage() {}, appendEntry() {}, setSessionName() {}, getSessionName() { return "Live coding chat"; }, setLabel() {},
    getActiveTools() { return []; }, getAllTools() { return []; }, setActiveTools() {}, refreshTools() {}, getCommands() { return []; },
    async setModel() { return false; }, getThinkingLevel() { return "medium" as never; }, setThinkingLevel() {},
  }, {
    getModel() { return undefined; }, isIdle() { return true; }, getSignal() { return undefined; }, abort() {}, hasPendingMessages() { return false; },
    shutdown() {}, getContextUsage() { return undefined; }, compact() {}, getSystemPrompt() { return ""; },
  });

  return runner;
}

/**
 * Reads and parses the chat-status JSON file.
 *
 * @param filePath Chat-status file path.
 * @returns Parsed chat-status content.
 */
async function readChatStatus(filePath: string): Promise<{ entries: Array<{ sessionFile?: string; sessionTitle?: string; cwd?: string; pid?: number }> }> {
  return JSON.parse(await readFile(filePath, "utf8"));
}

test("chat-status records running chats and removes them after inference ends", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "nexus-chat-status-"));
  const previousPath = process.env.NEXUS_CHAT_STATUS_PATH;
  const statusPath = join(tempDir, "chat-status");
  const sessionFile = join(tempDir, "session.jsonl");
  process.env.NEXUS_CHAT_STATUS_PATH = statusPath;

  try {
    const runner = await createChatStatusRunner(sessionFile);

    await runner.emit({ type: "agent_start" });
    const running = await readChatStatus(statusPath);
    assert.equal(running.entries.length, 1);
    assert.equal(running.entries[0]?.sessionFile, sessionFile);
    assert.equal(running.entries[0]?.sessionTitle, "Live coding chat");
    assert.equal(running.entries[0]?.cwd, process.cwd());
    assert.equal(running.entries[0]?.pid, process.pid);

    await runner.emit({
      type: "agent_end",
      messages: [{
        role: "assistant",
        content: [],
        api: "faux",
        provider: "faux",
        model: "faux",
        usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
        stopReason: "aborted",
        timestamp: 1,
      } as never],
    });
    const stopped = await readChatStatus(statusPath);
    assert.deepEqual(stopped.entries, []);
  } finally {
    if (previousPath === undefined) delete process.env.NEXUS_CHAT_STATUS_PATH;
    else process.env.NEXUS_CHAT_STATUS_PATH = previousPath;
    await rm(tempDir, { force: true, recursive: true });
  }
});
