import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { prepareNexusTest } from "../shared/prepareNexusTest.js";

const AGENT_TUI = "agent-tui";
const SESSION_NAME = "chrome-disabled-check";

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

test("agent-tui: /chrome command NOT present when pi-chrome is disabled", async () => {
  // Prepare: create session, launch Nexus (just dev), open /pi-packages
  const { sessionName, dumpDir } = prepareNexusTest({ sessionName: SESSION_NAME });

  // Wait for Nexus to boot (5s is enough)
  await new Promise((resolve) => setTimeout(resolve, 5_000));

  // Wait for modal to render
  await new Promise((resolve) => setTimeout(resolve, 3_000));

  // Navigate to pi-chrome row (down arrow), toggle it off (space)
  agentTui("send-keys", sessionName, "Down");
  await new Promise((resolve) => setTimeout(resolve, 500));
  agentTui("send-keys", sessionName, "Space"); // toggle disable
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Re-position: Home + down to ensure pi-chrome is selected
  agentTui("send-keys", sessionName, "Home");
  await new Promise((resolve) => setTimeout(resolve, 500));
  agentTui("send-keys", sessionName, "Down");
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Toggle pi-chrome off again
  agentTui("send-keys", sessionName, "Space");
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Close the modal
  agentTui("send-keys", sessionName, "End");
  await new Promise((resolve) => setTimeout(resolve, 2_000));
  agentTui("send-keys", sessionName, "Esc");
  await new Promise((resolve) => setTimeout(resolve, 1_000));

  // Restart Nexus via /restart
  agentTui("exec", sessionName, "/restart");
  agentTui("send-keys", sessionName, "Enter");

  // Wait for Nexus to fully restart and boot again
  await new Promise((resolve) => setTimeout(resolve, 5_000));

  // Type /chrome and press Enter
  agentTui("exec", sessionName, "/chrome");
  agentTui("send-keys", sessionName, "Enter");

  // Wait for the response
  await new Promise((resolve) => setTimeout(resolve, 5_000));

  // Dump session panes
  const paneFile = join(dumpDir, `${SESSION_NAME}-pane-0.ans`);
  agentTui("session", "dump", paneFile, sessionName);

  // Read and strip ANSI
  const rawText = await readFile(paneFile, "utf8");
  const plainText = stripAnsi(rawText);

  // Assert /chrome is NOT registered when pi-chrome is disabled
  const hasChromeOutput = plainText.includes("Chrome") || plainText.includes("Authori");

  assert.equal(
    hasChromeOutput,
    false,
    "Expected /chrome to NOT be registered after disabling pi-chrome. " +
    "The patch should have removed pi-chrome from Pi's settings packages, " +
    "so the /chrome slash command should not exist.",
  );

  // Cleanup
  try { agentTui("session", "delete", sessionName); } catch { /* ignore */ }
  try { await rm(dumpDir, { recursive: true, force: true }); } catch { /* ignore */ }
});
