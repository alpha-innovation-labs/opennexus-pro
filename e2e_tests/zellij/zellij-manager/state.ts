/**
 * state.ts — Read/write state.json (port, pid, sessions, token).
 *
 * Persists zellij-manager state so the CLI survives across invocations.
 * State file lives at ~/.config/zellij-manager/state.json.
 */

import * as fs from "node:fs";
import * as path from "node:path";

const STATE_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE || "",
  ".config",
  "zellij-manager",
);

const STATE_FILE = path.join(STATE_DIR, "state.json");

/**
 * Shape of the persisted state file.
 */
export interface State {
  /** The port the zellij web server is running on. */
  port: number;
  /** PID of the zellij web server process (0 if not running). */
  webServerPid: number;
  /** List of active zellij session names. */
  activeSessions: string[];
  /** The most recently generated auth token (if any). */
  lastToken: string;
  /** Timestamp of the last state write (ISO 8601). */
  updatedAt: string;
}

/**
 * Default initial state with sensible defaults.
 */
const DEFAULT_STATE: State = {
  port: 8082,
  webServerPid: 0,
  activeSessions: [],
  lastToken: "",
  updatedAt: new Date().toISOString(),
};

/**
 * Ensure the state directory exists.
 */
function ensureStateDir(): void {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

/**
 * Read the current state from disk. Returns DEFAULT_STATE if the file
 * does not exist or is invalid JSON.
 */
export function readState(): State {
  ensureStateDir();
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<State>;
    // Merge with defaults so missing keys get sensible values.
    return { ...DEFAULT_STATE, ...parsed, updatedAt: parsed.updatedAt || new Date().toISOString() };
  } catch {
    return { ...DEFAULT_STATE, updatedAt: new Date().toISOString() };
  }
}

/**
 * Write state to disk. Exits with a non-zero code on failure.
 */
export function writeState(state: State): void {
  ensureStateDir();
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error(`ERROR: Failed to write state file ${STATE_FILE}: ${err}`);
    process.exit(1);
  }
}
