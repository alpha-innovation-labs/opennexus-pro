import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const AGENT_TUI = "agent-tui";
const SESSION_NAME = "chrome-disabled-check";
const DUMP_DIR = join(tmpdir(), "nexus-chrome-disabled-dump");

/**
 * Runs an agent-tui CLI subcommand and returns trimmed stdout.
 */
function agentTui(...args: string[]): string {
  return execFileSync(AGENT_TUI, args, { encoding: "utf8" }).trim();
}

/**
 * Strips ANSI escape sequences from raw text, returning plain text.
 */
function stripAnsi(text: string): string {
  return text
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "")
    .replace(/\x1b\[[0-9]*m/g, "")
    .replace(/\x1b\[[0-9]*[A-Z]/g, "");
}

test("agent-tui: /chrome command NOT present when pi-chrome is disabled", async () => {
  console.log("[1/20] START — cleaning up previous session and dump dir");
  try { agentTui("session", "delete", SESSION_NAME); } catch { /* ignore */ }
  try { await rm(DUMP_DIR, { recursive: true, force: true }); } catch { /* ignore */ }
  console.log("[2/20] CLEANUP DONE");

  // Create a fresh zellij session
  console.log("[3/20] CREATING zellij session:", SESSION_NAME);
  agentTui("session", "create", SESSION_NAME);
  console.log("[4/20] SESSION CREATED — launching local 'just dev' (not release 'nexus')");

  // Launch local dev Nexus via 'just dev' (not the installed release 'nexus')
  agentTui("exec", SESSION_NAME, "just dev");
  console.log("[5/20] 'just dev' LAUNCHED — pressing Enter to start");

  // Press Enter to start Nexus
  agentTui("send-keys", SESSION_NAME, "Enter");

  // Wait for Nexus to boot (5s is enough)
  await new Promise((resolve) => setTimeout(resolve, 5_000));
  console.log("[6/20] NEXUS BOOTED — opening /pi-packages");

  // Open /pi-packages modal
  agentTui("exec", SESSION_NAME, "/pi-packages");
  agentTui("send-keys", SESSION_NAME, "Enter");
  console.log("[7/20] /pi-packages MODAL OPENED — waiting for render");

  // Wait for modal to render
  await new Promise((resolve) => setTimeout(resolve, 3_000));

  // Navigate to pi-chrome row (down arrow), toggle it off (space)
  console.log("[8/20] NAVIGATING to pi-chrome row (down arrow)");
  agentTui("send-keys", SESSION_NAME, "Down");
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("[9/20] TOGGLING pi-chrome off (space)");
  agentTui("send-keys", SESSION_NAME, "Space"); // toggle disable
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Re-position: Home + down to ensure pi-chrome is selected
  console.log("[10/20] RE-POSITIONING (Home + down to ensure pi-chrome selected)");
  agentTui("send-keys", SESSION_NAME, "Home");
  await new Promise((resolve) => setTimeout(resolve, 500));
  agentTui("send-keys", SESSION_NAME, "Down"); // down to pi-chrome
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Toggle pi-chrome off again
  console.log("[11/20] TOGGLING pi-chrome off again (space)");
  agentTui("send-keys", SESSION_NAME, "Space"); // toggle
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Close the modal
  console.log("[12/20] CLOSING modal (End/Escape)");
  agentTui("send-keys", SESSION_NAME, "End"); // End (save/close)
  await new Promise((resolve) => setTimeout(resolve, 2_000));

  // Escape to close any open modal
  console.log("[13/20] ESCAPE to close any open modal");
  agentTui("send-keys", SESSION_NAME, "Esc");
  await new Promise((resolve) => setTimeout(resolve, 1_000));

  // Restart Nexus via /restart
  console.log("[14/20] RESTARTING Nexus via /restart");
  agentTui("exec", SESSION_NAME, "/restart");
  agentTui("send-keys", SESSION_NAME, "Enter");

  // Wait for Nexus to fully restart and boot again (5s is enough)
  await new Promise((resolve) => setTimeout(resolve, 5_000));
  console.log("[15/20] NEXUS RESTARTED AND RE-BOOTED — typing /chrome");

  // Type /chrome and press Enter to trigger the command
  agentTui("exec", SESSION_NAME, "/chrome");
  agentTui("send-keys", SESSION_NAME, "Enter");

  // Wait for the response (or error) (5s is enough)
  await new Promise((resolve) => setTimeout(resolve, 5_000));
  console.log("[16/20] /chrome RESPONSE RECEIVED — dumping session panes");

  // Dump the session panes to ANSI files.
  // The dump command expects an output FILE path (directory is derived from it),
  // not a bare directory — so we pass the full expected file path.
  const paneFile = join(DUMP_DIR, `${SESSION_NAME}-pane-0.ans`);
  const dumpResult = agentTui("session", "dump", paneFile, SESSION_NAME);
  console.log("[17/20] DUMP DONE — reading pane file");

  // Read and strip ANSI from the dump file
  const rawText = await readFile(paneFile, "utf8");
  const plainText = stripAnsi(rawText);
  console.log("[18/20] ANSI STRIPPED — evaluating output");

  // Assert /chrome is NOT registered when pi-chrome is disabled
  const hasChromeOutput = plainText.includes("Chrome") || plainText.includes("Authori");

  console.log("=== Dumped output (disabled scenario) ===");
  console.log(plainText);
  console.log("==========================================");
  console.log(`/chrome registered when disabled: ${hasChromeOutput}`);
  console.log("[19/20] ASSERT EVALUATED — pi-chrome should NOT be loaded");

  assert.equal(
    hasChromeOutput,
    false,
    "Expected /chrome to NOT be registered after disabling pi-chrome. " +
    "The patch should have removed pi-chrome from Pi's settings packages, " +
    "so the /chrome slash command should not exist.",
  );

  // Cleanup
  console.log("[20/20] CLEANUP — deleting session and dump dir");
  try { agentTui("session", "delete", SESSION_NAME); } catch { /* ignore */ }
  try { await rm(DUMP_DIR, { recursive: true, force: true }); } catch { /* ignore */ }
  console.log("[DONE] Cleanup complete — session deleted, dump dir removed");
});
