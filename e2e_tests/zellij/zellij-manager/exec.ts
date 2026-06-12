/**
 * exec.ts — Execute commands inside zellij sessions.
 *
 * Wraps `zellij --session <name> action paste --` and
 * `zellij --session <name> action send-keys --` to send
 * text and keypresses into a running session.
 */

import { execSync } from "node:child_process";

/**
 * Paste text into a zellij session and press Enter.
 *
 * @param session — Session name.
 * @param text — Text to paste.
 */
export function execCommand(session: string, text: string): void {
  console.log(`[exec] Session "${session}": ${text}`);
  execSync(`zellij --session "${session}" action paste -- "${text}"`, {
    stdio: ["pipe", "pipe", "pipe"],
  });
  execSync(`zellij --session "${session}" action send-keys -- "Enter"`, {
    stdio: ["pipe", "pipe", "pipe"],
  });
}

/**
 * Run a bash script inside a zellij session.
 * Reads the script file and executes each line as an execCommand.
 *
 * @param session — Session name.
 * @param scriptPath — Path to a .sh script file.
 */
export function execScript(session: string, scriptPath: string): void {
  const fs = require("node:fs");

  if (!fs.existsSync(scriptPath)) {
    console.error(`ERROR: Script not found: ${scriptPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(scriptPath, "utf-8");
  const lines = content
    .split("\n")
    .map((l: string) => l.trim())
    .filter((l: string) => l && !l.startsWith("#"));

  console.log(`[exec-script] Running ${lines.length} commands from ${scriptPath}`);
  for (const line of lines) {
    execCommand(session, line);
  }
}
