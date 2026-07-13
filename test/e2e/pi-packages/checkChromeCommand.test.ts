import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const AGENT_TUI = "agent-tui";
const SESSION_NAME = "chrome-command-check";
const DUMP_DIR = join(tmpdir(), "nexus-chrome-dump");

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

test("agent-tui: /chrome command presence check (pi-chrome enabled)", async () => {
  console.log("[1/8] START — cleaning up previous session and dump dir");
  try { agentTui("session", "delete", SESSION_NAME); } catch { /* ignore */ }
  try { await rm(DUMP_DIR, { recursive: true, force: true }); } catch { /* ignore */ }
  console.log("[2/8] CLEANUP DONE");

  // Create a fresh zellij session
  console.log("[3/8] CREATING zellij session:", SESSION_NAME);
  agentTui("session", "create", SESSION_NAME);
  console.log("[4/8] SESSION CREATED — launching local 'just dev' (not release 'nexus')");

  // Launch local dev Nexus via 'just dev' (not the installed release 'nexus')
  agentTui("exec", SESSION_NAME, "just dev");
  console.log("[5/8] 'just dev' LAUNCHED — pressing Enter to start");

  // Press Enter to start Nexus
  agentTui("send-keys", SESSION_NAME, "Enter");

  // Wait for Nexus to boot (5s is enough)
  await new Promise((resolve) => setTimeout(resolve, 5_000));
  console.log("[6/8] NEXUS BOOTED — typing /chrome and pressing Enter");

  // Type /chrome and press Enter to trigger the command
  agentTui("exec", SESSION_NAME, "/chrome");
  agentTui("send-keys", SESSION_NAME, "Enter");

  // Wait for the modal to render (5s is enough)
  await new Promise((resolve) => setTimeout(resolve, 5_000));
  console.log("[7/8] MODAL RENDERED — dumping session panes");

  // Dump the session panes to ANSI files
  const dumpResult = agentTui("session", "dump", DUMP_DIR, SESSION_NAME);
  console.log("[8/8] DUMP DONE — reading and evaluating pane file");

  // Read and strip ANSI from the dump file
  const paneFile = join(DUMP_DIR, `${SESSION_NAME}-pane-0.ans`);
  const rawText = await readFile(paneFile, "utf8");
  const plainText = stripAnsi(rawText);

  // If pi-chrome is enabled, we expect "Chrome connected" or "Authori" in the output.
  // If pi-chrome is disabled (after the patch), we expect no chrome-related text.
  const hasChromeOutput = plainText.includes("Chrome") || plainText.includes("Authori");

  console.log("=== Dumped output ===");
  console.log(plainText);
  console.log("=====================");
  console.log(`/chrome registered: ${hasChromeOutput}`);
  console.log("[DONE] ASSERT EVALUATED — cleaning up");

  assert.equal(
    hasChromeOutput,
    true,
    "Expected /chrome to be a registered command (pi-chrome is enabled by default). " +
    "If this fails, pi-chrome may not be installed.",
  );

  // Cleanup
  try { agentTui("session", "delete", SESSION_NAME); } catch { /* ignore */ }
  try { await rm(DUMP_DIR, { recursive: true, force: true }); } catch { /* ignore */ }
  console.log("[DONE] Cleanup complete — session deleted, dump dir removed");
});
