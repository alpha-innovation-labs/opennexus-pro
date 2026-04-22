import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SessionManager } from "@mariozechner/pi-coding-agent";

/**
 * Creates one persisted session fixture for CLI session-list tests.
 *
 * @returns Session directory and session ID.
 */
export async function createCliSessionFixture(): Promise<{ sessionDir: string; sessionId: string }> {
  const sessionDir = await mkdtemp(join(tmpdir(), "nexus-cli-sessions-"));
  const manager = SessionManager.create(process.cwd(), sessionDir);
  manager.appendSessionInfo("CLI sessions fixture");
  manager.appendMessage({
    role: "user",
    content: [{ type: "text", text: "CLI sessions fixture prompt" }],
    timestamp: Date.now(),
  } as never);
  return { sessionDir, sessionId: manager.getSessionId() };
}
