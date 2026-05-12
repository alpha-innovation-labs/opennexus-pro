import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { SessionManager } from "@earendil-works/pi-coding-agent";

/**
 * Creates one persisted Nexus session fixture inside a temporary HOME directory for a chosen cwd.
 *
 * @param homeDir Temporary HOME directory for the test run.
 * @param cwd Working directory stored in the session header.
 * @param title User-facing session title written into session metadata.
 * @returns Session directory, ID, and file path.
 */
export async function createNexusCliSessionFixtureForCwd(
  homeDir: string,
  cwd: string,
  title: string,
): Promise<{ sessionDir: string; sessionId: string; sessionPath: string }> {
  const encodedCwd = `--${cwd.replace(/^[/\\]/, "").replace(/[/\\:]/g, "-")}--`;
  const sessionDir = join(homeDir, ".local", "share", "nexus", "agent", "sessions", encodedCwd);
  await mkdir(sessionDir, { recursive: true });

  const manager = SessionManager.create(cwd, sessionDir);
  manager.appendSessionInfo(title);
  manager.appendMessage({
    role: "user",
    content: [{ type: "text", text: `${title} prompt` }],
    timestamp: Date.now() - 1_000,
  } as never);
  manager.appendMessage({
    role: "assistant",
    content: [{ type: "text", text: `${title} assistant` }],
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
