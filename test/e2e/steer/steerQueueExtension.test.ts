import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createExtensionRuntime, loadExtensionFromFactory } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js";
import { ExtensionRunner } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/runner.js";
import { createEventBus } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/core/event-bus.js";
import { appendSteerQueueItem } from "../../../packages/extension-core/src/steer-queue/appendSteerQueueItem.js";
import { registerSteerQueueExtension } from "../../../packages/extension-core/src/steer-queue/registerSteerQueueExtension.js";

/** Recorded sendUserMessage call. */
type SentUserMessage = { text: string; options?: { deliverAs?: string } };

/**
 * Waits until a predicate succeeds or times out.
 *
 * @param predicate Completion predicate.
 */
async function waitUntil(predicate: () => boolean): Promise<void> {
  const startedAt = Date.now();
  while (!predicate()) {
    if (Date.now() - startedAt > 2_000) throw new Error("Timed out waiting for steer queue delivery");
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

/**
 * Creates an extension runner with the steer queue extension installed.
 *
 * @param sent Mutable sent-message capture list.
 * @returns Extension runner configured for lifecycle event emission.
 */
async function createSteerQueueRunner(sent: SentUserMessage[]): Promise<ExtensionRunner> {
  const runtime = createExtensionRuntime();
  const eventBus = createEventBus();
  const extension = await loadExtensionFromFactory(registerSteerQueueExtension, process.cwd(), eventBus, runtime, "<steer-queue-test>");
  const sessionManager = {
    getSessionId() { return "session-steer-test"; },
    getSessionFile() { return undefined; },
    getSessionName() { return "Steer queue chat"; },
    getSessionDir() { return process.cwd(); },
  };
  const runner = new ExtensionRunner([extension], runtime, process.cwd(), sessionManager as never, {} as never);

  runner.bindCore({
    sendMessage() {},
    sendUserMessage(content: string | unknown[], options?: { deliverAs?: string }) {
      if (typeof content === "string") sent.push({ text: content, options });
    },
    appendEntry() {},
    setSessionName() {},
    getSessionName() { return "Steer queue chat"; },
    setLabel() {},
    getActiveTools() { return []; },
    getAllTools() { return []; },
    setActiveTools() {},
    refreshTools() {},
    getCommands() { return []; },
    async setModel() { return false; },
    getThinkingLevel() { return "medium" as never; },
    setThinkingLevel() {},
  }, {
    getModel() { return undefined; },
    isIdle() { return true; },
    getSignal() { return undefined; },
    abort() {},
    hasPendingMessages() { return false; },
    shutdown() {},
    getContextUsage() { return undefined; },
    compact() {},
    getSystemPrompt() { return ""; },
  });

  return runner;
}

test("steer queue extension submits queued messages while idle", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "nexus-steer-queue-"));
  const previousAgentDir = process.env.NEXUS_CODING_AGENT_DIR;
  const previousPollMs = process.env.NEXUS_STEER_QUEUE_POLL_MS;
  const sent: SentUserMessage[] = [];
  process.env.NEXUS_CODING_AGENT_DIR = tempDir;
  process.env.NEXUS_STEER_QUEUE_POLL_MS = "10";

  try {
    const runner = await createSteerQueueRunner(sent);
    await runner.emit({ type: "session_start", reason: "startup" });
    await appendSteerQueueItem("session-steer-test", "Please summarize current findings");

    await waitUntil(() => sent.length === 1);
    assert.deepEqual(sent[0], { text: "Please summarize current findings", options: undefined });
    await runner.emit({ type: "session_shutdown", reason: "quit" });
  } finally {
    if (previousAgentDir === undefined) delete process.env.NEXUS_CODING_AGENT_DIR;
    else process.env.NEXUS_CODING_AGENT_DIR = previousAgentDir;
    if (previousPollMs === undefined) delete process.env.NEXUS_STEER_QUEUE_POLL_MS;
    else process.env.NEXUS_STEER_QUEUE_POLL_MS = previousPollMs;
    await rm(tempDir, { force: true, recursive: true });
  }
});

test("steer queue extension steers queued messages while busy", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "nexus-steer-queue-"));
  const previousAgentDir = process.env.NEXUS_CODING_AGENT_DIR;
  const previousPollMs = process.env.NEXUS_STEER_QUEUE_POLL_MS;
  const sent: SentUserMessage[] = [];
  process.env.NEXUS_CODING_AGENT_DIR = tempDir;
  process.env.NEXUS_STEER_QUEUE_POLL_MS = "10";

  try {
    const runner = await createSteerQueueRunner(sent);
    await runner.emit({ type: "session_start", reason: "startup" });
    await runner.emit({ type: "agent_start" });
    await appendSteerQueueItem("session-steer-test", "Stop exploring and patch the parser");

    await waitUntil(() => sent.length === 1);
    assert.deepEqual(sent[0], { text: "Stop exploring and patch the parser", options: { deliverAs: "steer" } });
    await runner.emit({ type: "agent_end", messages: [] as never });
    await runner.emit({ type: "session_shutdown", reason: "quit" });
  } finally {
    if (previousAgentDir === undefined) delete process.env.NEXUS_CODING_AGENT_DIR;
    else process.env.NEXUS_CODING_AGENT_DIR = previousAgentDir;
    if (previousPollMs === undefined) delete process.env.NEXUS_STEER_QUEUE_POLL_MS;
    else process.env.NEXUS_STEER_QUEUE_POLL_MS = previousPollMs;
    await rm(tempDir, { force: true, recursive: true });
  }
});
