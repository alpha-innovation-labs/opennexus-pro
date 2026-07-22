import { execFileSync } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";

const AGENT_TUI = "agent-tui";
const SESSION_NAME = "slashcmd-snapshot";

/**
 * Strips ANSI escape sequences from raw text, returning plain text.
 */
function stripAnsi(text: string): string {
  return text
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "")
    .replace(/\x1b\[[0-9]*m/g, "")
    .replace(/\x1b\[[0-9]*[A-Z]/g, "");
}

/**
 * Runs an agent-tui CLI subcommand and returns trimmed stdout.
 */
function agentTui(...args: string[]): string {
  return execFileSync(AGENT_TUI, args, { encoding: "utf8" }).trim();
}

describe("slashcmd", () => {
  test("slash command palette snapshot on /", async () => {
    // Ensure clean session from previous runs
    try { agentTui("session", "delete", SESSION_NAME); } catch { /* ignore */ }

    const dumpDir = join(tmpdir(), `nexus-${SESSION_NAME}-dump`);
    try { rm.sync(dumpDir, { recursive: true, force: true }); } catch { /* ignore */ }

    // Create a fresh agent-tui session and launch Nexus (without /pi-packages modal)
    agentTui("session", "create", SESSION_NAME);
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    // Retry exec until the session is ready (agent-tui session creation is async)
    let execRetries = 0;
    let execOk = false;
    while (execRetries < 5 && !execOk) {
      try {
        agentTui("exec", SESSION_NAME, "just dev");
        execOk = true;
      } catch {
        execRetries++;
        await new Promise((resolve) => setTimeout(resolve, 1_000));
      }
    }
    if (!execOk) throw new Error("Failed to exec just dev into session after retries");
    agentTui("send-keys", SESSION_NAME, "Enter");

    // Wait for Nexus to boot and render the main UI
    await new Promise((resolve) => setTimeout(resolve, 5_000));

    // Type `/` to open the slash command palette (use send-keys, not exec — `/` is a trigger, not a command)
    agentTui("send-keys", SESSION_NAME, "/");

    // Wait for the slash command palette to render
    await new Promise((resolve) => setTimeout(resolve, 1_000));

    // Dump session panes as a snapshot
    const paneFile = join(dumpDir, `${SESSION_NAME}-pane-0.ans`);
    agentTui("session", "dump", paneFile, SESSION_NAME);

    // Read and strip ANSI for analysis
    const rawText = await readFile(paneFile, "utf8");
    const plainText = stripAnsi(rawText);

    // Assert the slash command palette rendered (non-empty output with command entries)
    const hasCommands = plainText.split("\n").some((line) => line.trim().length > 0);

    if (!hasCommands) {
      // Write snapshot to stdout for debugging
      console.error("\n--- slashcmd snapshot (plain text) ---");
      console.error(plainText);
      console.error("--- end snapshot ---\n");
    }
    console.error(
      `[slashcmd] Snapshot written to ${paneFile}\n` +
      `[slashcmd] Pane lines: ${plainText.split("\n").length}\n` +
      `[slashcmd] Has command entries: ${hasCommands}`,
    );

  });
});
