import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { SessionManager } from "@earendil-works/pi-coding-agent";

/**
 * Creates one persisted Nexus session fixture inside a temporary HOME directory.
 *
 * @param homeDir Temporary HOME directory for the test run.
 * @returns Session directory, ID, and file path.
 */
export async function createNexusCliSessionFixture(homeDir: string): Promise<{ sessionDir: string; sessionId: string; sessionPath: string }> {
  const encodedCwd = `--${process.cwd().replace(/^[/\\]/, "").replace(/[/\\:]/g, "-")}--`;
  const sessionDir = join(homeDir, ".local", "share", "nexus", "agent", "sessions", encodedCwd);
  await mkdir(sessionDir, { recursive: true });

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
