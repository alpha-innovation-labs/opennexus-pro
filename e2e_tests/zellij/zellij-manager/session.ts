/**
 * session.ts — Create/delete/list zellij sessions.
 *
 * Wraps `zellij` CLI commands to manage background sessions.
 * Session state is persisted in state.json.
 */

import { execSync, spawnSync } from "node:child_process";
import { readState, writeState, State } from "./state";

/**
 * Result of listing sessions.
 */
export interface SessionList {
  /** List of active session names. */
  sessions: string[];
}

/**
 * Create a zellij background session with the given name.
 * Uses the `--create-background` flag to create a detached session.
 * Optionally accepts a layout and config path.
 *
 * @param name — Session name.
 * @param options — Optional layout and config file path.
 * @returns stdout from the zellij attach command.
 */
export function sessionCreate(
  name: string,
  options?: { layout?: string; config?: string },
): string {
  const state = readState();

  // Kill any existing session with this name first (matches existing behavior).
  try {
    execSync(`zellij kill-session "${name}" 2>/dev/null || true`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    // kill-session returns non-zero if session doesn't exist — ignore.
  }

  // Brief pause to let the old session fully die.
  spawnSync("sleep", ["2"], { stdio: "inherit" });

  // Build the zellij command.
  const configFlag = options?.config ? `--config "${options.config}"` : "";
  const layoutFlag = options?.layout ? `--layout ${options.layout}` : "";

  const cmd = `zellij ${configFlag} ${layoutFlag} attach --create-background "${name}"`.trim();

  console.log(`Creating session "${name}"...`);
  let output: string;
  try {
    output = execSync(cmd, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (err: unknown) {
    const stderr = (err as { stderr?: string }).stderr || (err as { message?: string }).message || String(err);
    console.error(`ERROR: Failed to create session "${name}":`);
    console.error(stderr);
    process.exit(1);
  }

  // Update state with the new session.
  const updated: State = {
    ...state,
    activeSessions: [...new Set([...state.activeSessions, name])],
    updatedAt: new Date().toISOString(),
  };
  writeState(updated);

  return output;
}

/**
 * Delete (kill) a zellij session by name.
 *
 * @param name — Session name to delete.
 * @returns stdout from the zellij kill-session command.
 */
export function sessionDelete(name: string): string {
  const state = readState();

  console.log(`Deleting session "${name}"...`);
  const output = execSync(`zellij kill-session "${name}"`, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  // Remove from active sessions in state.
  const updated: State = {
    ...state,
    activeSessions: state.activeSessions.filter((s) => s !== name),
    updatedAt: new Date().toISOString(),
  };
  writeState(updated);

  return output;
}

/**
 * List all active zellij sessions from the state file,
 * cross-referenced with actual zellij list-sessions output.
 *
 * @returns SessionList with the current session names.
 */
export function sessionList(): SessionList {
  const state = readState();

  try {
    const output = execSync("zellij list-sessions", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Parse session names from zellij output.
    // Format: "Session Name: <name>" or similar.
    const lines = output.trim().split("\n");
    const sessions: string[] = [];
    for (const line of lines) {
      const nameMatch = line.match(/Session Name:\s*(.+)/i);
      if (nameMatch) {
        sessions.push(nameMatch[1].trim());
      }
    }

    return { sessions };
  } catch {
    // list-sessions returns exit code 1 when no sessions exist.
    return { sessions: [] };
  }
}
