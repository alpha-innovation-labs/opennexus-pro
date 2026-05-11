import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { SessionManager } from "@earendil-works/pi-coding-agent";
import { createResumeLeaves } from "../../../packages/extension-core/src/slash-menu/createResumeLeaves.js";

/**
 * Creates one persisted session fixture for resume-summary tests.
 *
 * @returns Session directory and session path.
 */
async function createSessionFixture(): Promise<{ sessionDir: string; sessionPath: string }> {
  const sessionDir = await mkdtemp(join(tmpdir(), "nexus-resume-summary-"));
  const manager = SessionManager.create(process.cwd(), sessionDir);
  manager.appendSessionInfo("Resume transcript fixture");
  manager.appendMessage({ role: "user", content: [{ type: "text", text: "First user message" }], timestamp: Date.now() - 6 * 60 * 1000 } as never);
  manager.appendMessage({ role: "user", content: [{ type: "text", text: "Second user message" }], timestamp: Date.now() - 5 * 60 * 1000 } as never);
  manager.appendMessage({
    role: "assistant",
    content: [
      { type: "thinking", thinking: "Thinking once." },
      { type: "toolCall", id: "tool-1", name: "read", arguments: { path: "a.ts" } },
      { type: "toolCall", id: "tool-2", name: "grep", arguments: { pattern: "x" } },
      { type: "text", text: "Done." },
    ],
    timestamp: Date.now() - 4 * 60 * 1000,
    stopReason: "end_turn",
    usage: { input: 10, output: 20, cacheCreationInputTokens: 0, cacheReadInputTokens: 0 },
    provider: "openai",
    model: "gpt-5.4",
  } as never);
  return { sessionDir, sessionPath: manager.getSessionFile()! };
}

test("createResumeLeaves shows human, tool, thinking, and relative time summary", async () => {
  const originalNow = Date.now;
  const { sessionDir, sessionPath } = await createSessionFixture();

  Date.now = () => new Date("2026-04-22T12:40:00.000Z").getTime();

  try {
    const leaves = createResumeLeaves([
      {
        path: sessionPath,
        name: "Resume transcript fixture",
        modified: new Date("2026-04-22T12:35:00.000Z"),
      },
    ]);

    assert.equal(leaves[0]?.description, "󰀄 2 · 󰍉 2 · 󰧑 1 · 5m");
  } finally {
    Date.now = originalNow;
    await rm(sessionDir, { recursive: true, force: true });
  }
});
