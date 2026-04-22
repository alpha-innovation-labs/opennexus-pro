import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SessionManager } from "@mariozechner/pi-coding-agent";

/**
 * Creates one persisted session fixture for CLI e2e tests.
 *
 * @returns Session directory, ID, and file path.
 */
export async function createCliSessionFixture(): Promise<{ sessionDir: string; sessionId: string; sessionPath: string }> {
  const sessionDir = await mkdtemp(join(tmpdir(), "nexus-cli-e2e-session-"));
  const manager = SessionManager.create(process.cwd(), sessionDir);
  manager.appendSessionInfo("CLI resume fixture");
  manager.appendMessage({
    role: "user",
    content: [{ type: "text", text: "CLI resume prompt" }],
    timestamp: Date.now() - 1_000,
  } as never);
  manager.appendMessage({
    role: "assistant",
    content: [{ type: "text", text: "CLI resume assistant" }],
    timestamp: Date.now(),
    stopReason: "end_turn",
    usage: {
      input: 10,
      output: 20,
      cacheRead: 0,
      cacheWrite: 0,
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
    },
    provider: "openai",
    model: "gpt-5.4",
  } as never);
  return { sessionDir, sessionId: manager.getSessionId(), sessionPath: manager.getSessionFile()! };
}
