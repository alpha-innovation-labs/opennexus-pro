import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { prepareNexusTest } from "../shared/prepareNexusTest.js";

const AGENT_TUI = "agent-tui";
const SESSION_NAME = "chrome-command-check";

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

test("agent-tui: /chrome command presence check (pi-chrome enabled)", async () => {
  // Prepare: create session, launch Nexus (just dev), open /pi-packages
  const { sessionName, dumpDir } = prepareNexusTest({ sessionName: SESSION_NAME });

  // Wait for Nexus to boot (4s is enough)
  await new Promise((resolve) => setTimeout(resolve, 4_000));

  // Type /chrome and press Enter
  agentTui("exec", sessionName, "/chrome");
  agentTui("send-keys", sessionName, "Enter");

  // Wait for the modal to render
  await new Promise((resolve) => setTimeout(resolve, 5_000));

  // Dump session panes
  const paneFile = join(dumpDir, `${SESSION_NAME}-pane-0.ans`);
  agentTui("session", "dump", paneFile, sessionName);

  // Read and strip ANSI
  const rawText = await readFile(paneFile, "utf8");
  const plainText = stripAnsi(rawText);

  // If pi-chrome is enabled, we expect "Chrome connected" or "Authori" in the output.
  const hasChromeOutput = plainText.includes("Chrome") || plainText.includes("Authori");

  assert.equal(
    hasChromeOutput,
    true,
    "Expected /chrome to be a registered command (pi-chrome is enabled by default). " +
    "If this fails, pi-chrome may not be installed.",
  );

  // Cleanup
  try { agentTui("session", "delete", sessionName); } catch { /* ignore */ }
  try { await rm(dumpDir, { recursive: true, force: true }); } catch { /* ignore */ }
});
