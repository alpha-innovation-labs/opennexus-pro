#!/usr/bin/env tsx
/**
 * yaml_session_runner.ts — Execute a YAML-defined tmux session, capture
 * a full-page ASCII snapshot, and present it for user approval.
 *
 * Usage:
 *   tsx scripts/testing/yaml_session_runner.ts <path-to-yaml>
 *
 * YAML format (simple flat keys):
 *   sessionName: my-test-session
 *   cwd: /path/to/workdir
 *   command: nexus --resume abc123
 *   interactions:
 *     - { type: key, value: "hello", delay: 500 }
 *     - { type: mouse, value: "click 10,20", delay: 200 }
 *
 * Steps:
 *   1. Parse the YAML file (custom lightweight parser, no deps).
 *   2. Kill any existing tmux session with that name.
 *   3. Create the session running the specified command (optionally in cwd).
 *   4. Replay each interaction (key presses, mouse events, waits).
 *   5. Wait for stabilisation, then capture the full scrollback to snapshot.txt.
 *   6. Display the snapshot and prompt the user to approve or reject.
 *   7. On approval, persist the snapshot as the golden reference; on reject, exit 1.
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// ────────────────────────────────────────────────────────────────────────
// YAML — lightweight parser for the subset we need (no external deps)
// ────────────────────────────────────────────────────────────────────────

/**
 * Parse a simple YAML file into a nested object.
 *
 * Supports:
 *   - Top-level key: value pairs (string, number, boolean)
 *   - Simple lists: key: [val1, val2]  or  key:\n  - val
 *   - List of objects: key:\n  - { key: val, key2: val2 }
 *   - Nested objects: key:\n    subkey: val
 *
 * Does NOT support: anchors, multi-line strings, complex flow scalars.
 */
export function parseSimpleYaml(content: string): Record<string, unknown> {
  const lines = content.split("\n");
  const root: Record<string, unknown> = {};
  let currentKey: string | null = null;
  let currentList: unknown[] | null = null;
  let currentListItem: Record<string, unknown> | null = null;
  let inList = false;
  let inListItem = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Skip empty lines and comments
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    // Detect list item: "  - value" or "  - { key: val }"
    const listMatch = raw.match(/^(\s*)-\s+(.*)$/);
    if (listMatch) {
      inList = true;
      inListItem = false;
      const itemValue = listMatch[2].trim();

      // Create the list if it doesn't exist yet (first list item for a key)
      if (currentKey && !currentList) {
        currentList = [];
        root[currentKey] = currentList;
      }

      // Inline object: { key: val, key2: val2 }
      if (itemValue.startsWith("{") && itemValue.endsWith("}")) {
        inListItem = true;
        currentListItem = parseInlineObject(itemValue);
        if (currentList) {
          currentList.push(currentListItem);
        }
        continue;
      }

      // Simple scalar value
      if (currentList) {
        currentList.push(parseScalar(itemValue));
      }
      continue;
    }

    // Key: value pair
    const kvMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const valueStr = kvMatch[2].trim();

      // Flush previous list/item
      if (currentKey && currentList) {
        root[currentKey] = currentList;
      }

      currentKey = key;
      currentList = null;
      currentListItem = null;
      inList = false;
      inListItem = false;

      if (valueStr === "" || valueStr === "{}") {
        // This key starts a nested list — handled by subsequent "- " lines
        if (valueStr === "{}") {
          root[key] = {};
          currentKey = null;
        }
        // else: next lines will be list items; currentList stays null
      } else {
        // Inline value
        root[key] = parseScalar(valueStr);
        currentKey = null;
      }
      continue;
    }

    // Nested key (indented key: value inside a parent)
    const nestedMatch = raw.match(/^(\s+)([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (nestedMatch) {
      const indent = nestedMatch[1].length;
      const key = nestedMatch[2];
      const valueStr = nestedMatch[3].trim();

      // If we're in a list item, add to currentListItem
      if (inList && currentListItem) {
        currentListItem[key] = parseScalar(valueStr);
        continue;
      }

      // Nested object under a key
      if (currentKey && !inList) {
        const parent = root[currentKey];
        if (typeof parent === "object" && parent !== null && !Array.isArray(parent)) {
          (parent as Record<string, unknown>)[key] = parseScalar(valueStr);
        }
      }
    }
  }

  // Flush final list
  if (currentKey && currentList) {
    root[currentKey] = currentList;
  }

  return root;
}

/**
 * Parse an inline YAML object string: "{ key: val, key2: val2 }"
 */
function parseInlineObject(str: string): Record<string, unknown> {
  const inner = str.slice(1, -1).trim();
  const result: Record<string, unknown> = {};

  if (inner === "") return result;

  // Split by commas, but respect nested braces
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of inner) {
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());

  for (const part of parts) {
    const kv = part.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (kv) {
      result[kv[1]] = parseScalar(kv[2].trim());
    }
  }

  return result;
}

/**
 * Parse a scalar YAML value into a JS primitive.
 */
function parseScalar(value: string): string | number | boolean | string[] {
  // Boolean
  if (value === "true") return true;
  if (value === "false") return false;
  // Number
  if (/^-?\d+$/.test(value)) return Number(value);
  // Flow sequence: [val1, val2, val3]
  const flowSeqMatch = value.match(/^\[\s*(.*)\s*\]$/);
  if (flowSeqMatch) {
    const inner = flowSeqMatch[1].trim();
    if (inner === "") return [];
    return inner.split(",").map((v) => parseScalar(v.trim()));
  }
  // String (strip quotes)
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

// ────────────────────────────────────────────────────────────────────────
// Interaction types
// ────────────────────────────────────────────────────────────────────────

/**
 * Represents one interaction to replay inside a tmux session.
 */
export interface Interaction {
  /** Type of interaction: key press, mouse event, or wait */
  type: "key" | "mouse" | "wait";
  /** The value to send (key string, mouse coordinates/command, or raw text) */
  value: string;
  /** Milliseconds to wait before this interaction (0 if not specified) */
  delay?: number;
}

// ────────────────────────────────────────────────────────────────────────
// Tmux session management
// ────────────────────────────────────────────────────────────────────────

/**
 * Kill an existing tmux session if one exists with the given name.
 */
function killSession(sessionName: string): void {
  try {
    execSync(`tmux kill-session -t "${sessionName}" 2>/dev/null || true`, {
      stdio: "ignore",
    });
  } catch {
    // Session doesn't exist — ignore
  }
}

/**
 * Create a detached tmux session running the given command.
 *
 * @param sessionName Name for the tmux session.
 * @param command Command to execute inside the session.
 * @param cwd Optional working directory.
 */
function createSession(sessionName: string, command: string, cwd?: string): void {
  const tmuxCmd = cwd
    ? `tmux new-session -d -s "${sessionName}" bash -c "cd ${quoteShellArg(cwd)} && ${quoteShellArg(command)}"`
    : `tmux new-session -d -s "${sessionName}" ${quoteShellArg(command)}`;
  execSync(tmuxCmd, { stdio: "inherit" });
}

/**
 * Send a key sequence to a tmux session.
 *
 * @param sessionName Target tmux session.
 * @param keys Key string to send (e.g., "Enter", "Ctrl+c", "hello").
 * @param delayMs Optional delay in milliseconds before sending.
 */
function sendKeys(sessionName: string, keys: string, delayMs?: number): void {
  if (delayMs && delayMs > 0) {
    execSync(`sleep ${(delayMs / 1000).toFixed(2)}`, { stdio: "ignore" });
  }
  execSync(`tmux send-keys -t "${sessionName}" ${quoteShellArg(keys)} Enter`, {
    stdio: "ignore",
  });
}

/**
 * Send a mouse event to a tmux session.
 *
 * @param sessionName Target tmux session.
 * @param mouseCmd Mouse command string (e.g., "click 10,20" or "scroll 5").
 * @param delayMs Optional delay in milliseconds before sending.
 */
function sendMouse(sessionName: string, mouseCmd: string, delayMs?: number): void {
  if (delayMs && delayMs > 0) {
    execSync(`sleep ${(delayMs / 1000).toFixed(2)}`, { stdio: "ignore" });
  }
  // tmux mouse events: send-keys -M for mouse, or use the mouse-mode commands
  execSync(
    `tmux send-keys -t "${sessionName}" ${quoteShellArg(mouseCmd)} -- -M`,
    { stdio: "ignore" },
  );
}

/**
 * Wait for a given number of milliseconds.
 *
 * @param ms Milliseconds to sleep.
 */
function waitFor(ms: number): void {
  execSync(`sleep ${(ms / 1000).toFixed(2)}`, { stdio: "ignore" });
}

/**
 * Capture the full scrollback buffer of a tmux session to a file.
 *
 * @param sessionName Target tmux session.
 * @param outputPath Path to write the snapshot.
 * @returns The snapshot content as a string.
 */
function captureSnapshot(sessionName: string, outputPath: string): string {
  const output = execSync(
    `tmux capture-pane -t "${sessionName}" -S - -E - -p`,
    { encoding: "utf-8" },
  );
  writeFileSync(outputPath, output, "utf-8");
  return output;
}

/**
 * Quote a shell argument safely (handles spaces, special chars).
 */
function quoteShellArg(arg: string): string {
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

// ────────────────────────────────────────────────────────────────────────
// User approval
// ────────────────────────────────────────────────────────────────────────

/**
 * Display a snapshot to the user and prompt for approval.
 *
 * @param snapshot The captured terminal output.
 * @returns true if the user approves, false otherwise.
 */
function promptApproval(snapshot: string): boolean {
  console.log("\n" + "─".repeat(72));
  console.log("SNAPSHOT — user approval required");
  console.log("─".repeat(72));
  console.log(snapshot);
  console.log("─".repeat(72));
  console.log('Type "approve" to save as golden reference, or "reject" to discard:');

  // Read user input synchronously from stdin
  const input = execSync('read -r line && echo "$line"', {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "ignore"],
  }).trim();

  return input.toLowerCase() === "approve";
}

/**
 * Persist the snapshot as the golden reference file.
 *
 * @param snapshotPath Path to the snapshot file.
 * @param goldenPath Path to the golden reference file.
 */
function persistGoldenReference(snapshotPath: string, goldenPath: string): void {
  const content = readFileSync(snapshotPath, "utf-8");
  writeFileSync(goldenPath, content, "utf-8");
  console.log(`\n✓ Golden reference saved to ${goldenPath}`);
}

// ────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────

/**
 * Run a YAML-defined tmux session, capture a snapshot, and prompt for approval.
 *
 * @param yamlPath Path to the YAML configuration file.
 */
export function runYamlSession(yamlPath: string): void {
  // Step 1: Read and parse the YAML file
  if (!existsSync(yamlPath)) {
    console.error(`Error: YAML file not found: ${yamlPath}`);
    process.exit(1);
  }

  const content = readFileSync(yamlPath, "utf-8");
  const config = parseSimpleYaml(content);

  // Step 2: Extract configuration
  const sessionName = String(config.sessionName ?? "nexus-test");
  const cwd = config.cwd ? String(config.cwd) : undefined;
  const command = String(config.command ?? "");

  if (!command) {
    console.error("Error: 'command' is required in the YAML file.");
    process.exit(1);
  }

  // Parse interactions (list of objects or list of scalars)
  const interactionsRaw = config.interactions;
  const interactions: Interaction[] = Array.isArray(interactionsRaw)
    ? interactionsRaw.map((item) => {
        if (typeof item === "object" && item !== null) {
          const obj = item as Record<string, unknown>;
          return {
            type: String(obj.type ?? "key") as "key" | "mouse" | "wait",
            value: String(obj.value ?? ""),
            delay: obj.delay !== undefined ? Number(obj.delay) : undefined,
          };
        }
        // Scalar item — treat as a key press
        return { type: "key" as const, value: String(item), delay: undefined };
      })
    : [];

  // Step 3: Determine output paths
  const scriptDir = process.cwd();
  const snapshotFile = join(scriptDir, "snapshot.txt");
  const goldenDir = join(scriptDir, "golden");
  const goldenFile = join(goldenDir, `${sessionName.replace(/[^a-zA-Z0-9_-]/g, "_")}.txt`);

  // Ensure golden directory exists
  if (!existsSync(goldenDir)) {
    mkdirSync(goldenDir, { recursive: true });
  }

  // Step 4: Kill existing session (if any)
  killSession(sessionName);

  // Step 5: Create the session
  createSession(sessionName, command, cwd);

  // Step 6: Replay interactions
  for (const interaction of interactions) {
    switch (interaction.type) {
      case "key":
        sendKeys(sessionName, interaction.value, interaction.delay);
        break;
      case "mouse":
        sendMouse(sessionName, interaction.value, interaction.delay);
        break;
      case "wait":
        waitFor(Number(interaction.value) || 1000);
        break;
    }
  }

  // Step 7: Wait for process to stabilise, then capture snapshot
  const waitSeconds = Number(config.waitSeconds ?? 3);
  waitFor(waitSeconds * 1000);

  const snapshot = captureSnapshot(sessionName, snapshotFile);

  // Step 8: User approval
  if (promptApproval(snapshot)) {
    persistGoldenReference(snapshotFile, goldenFile);
    console.log("✓ Session snapshot approved and persisted.");
  } else {
    console.log("✗ Snapshot rejected. Golden reference not updated.");
    process.exit(1);
  }
}

// ────────────────────────────────────────────────────────────────────────
// CLI entry point
// ────────────────────────────────────────────────────────────────────────

const isMainModule =
  process.argv[1] !== undefined &&
  (process.argv[1].endsWith("yaml_session_runner.ts") ||
    process.argv[1].endsWith("yaml_session_runner.mjs"));

if (isMainModule) {
  const yamlPath = process.argv[2];
  if (!yamlPath) {
    console.error("Usage: tsx scripts/testing/yaml_session_runner.ts <path-to-yaml>");
    process.exit(1);
  }
  runYamlSession(yamlPath);
}
