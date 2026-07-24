/**
 * Herdr workspace preparation library.
 *
 * Creates a workspace, polls until the root pane is available, and returns
 * the workspace + pane identifiers so callers can start agents and run e2e
 * test commands inside that pane.
 *
 * This module is the single source of truth for Herdr setup — both test
 * code and CLI entrypoints import from here.
 */

import { execSync, spawnSync } from "node:child_process";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Runs a herdr CLI command and returns parsed JSON, or throws on failure.
 */
export function runHerdr(
  args: string[],
  { timeoutMs = 10_000 }: { timeoutMs?: number } = {},
): Record<string, unknown> {
  const result = spawnSync("herdr", args, {
    encoding: "utf-8",
    timeout: timeoutMs,
  });

  if (result.error) {
    throw new Error(`herdr ${args.join(" ")}: ${result.error.message}`);
  }

  const stderr = result.stderr?.toString() ?? "";
  const stdout = result.stdout?.toString() ?? "";

  // CLI errors write JSON to stderr; success writes JSON to stdout.
  const source = stderr.startsWith("{") ? stderr : stdout;

  if (!source) {
    throw new Error(`herdr ${args.join(" ")}: no output`);
  }

  // Some commands (e.g. `agent read`) output terminal content, not JSON.
  // If it doesn't start with "{", return the raw text.
  if (!source.startsWith("{")) {
    return { _raw: source } as Record<string, unknown>;
  }

  try {
    return JSON.parse(source) as Record<string, unknown>;
  } catch {
    throw new Error(`herdr ${args.join(" ")}: invalid JSON — ${source.slice(0, 200)}`);
  }
}

/**
 * Drills into nested object keys, returning undefined if any key is missing.
 */
export function drill(data: Record<string, unknown>, ...keys: string[]): string | undefined {
  let current: unknown = data;
  for (const key of keys) {
    if (typeof current === "object" && current !== null && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

/**
 * Resolves what `just -n dev` actually runs, extracting the binary name.
 * Handles both plain recipes and shebang-body recipes (which print the
 * full script when queried with `-n`).
 */
export function resolveJustDevBinary(): string {
  let output: string;
  try {
    // Use `npx just` because `tsx` may not resolve `just` from PATH.
    output = execSync("npx just -n dev", { encoding: "utf-8", timeout: 10000 });
  } catch {
    throw new Error("Could not run `npx just -n dev` — is just installed?");
  }

  // Shebang-body recipes print the entire script. Extract the final
  // executable line (the one that runs the actual binary).
  const lines = output.trim().split("\n");
  // Find the last non-empty, non-comment line that looks like a command.
  let commandLine = "";
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line && !line.startsWith("#") && !line.startsWith("set") && line !== "set -a" && line !== "set +a") {
      commandLine = line;
      break;
    }
  }

  // Extract the actual binary from the command line.
  // Handles: `bun ...`, `tsx ...`, `npx --prefix pkg tsx ...`, `node ...`, `python ...`
  const bunMatch = commandLine.match(/\bbun\b/);
  const tsxMatch = commandLine.match(/\btsx\b/);
  const nodeMatch = commandLine.match(/\bnode\b/);
  const pythonMatch = commandLine.match(/\bpython\b/);

  if (bunMatch) return "bun";
  if (tsxMatch) return "tsx";

  if (nodeMatch) return "node";
  if (pythonMatch) return "python";

  // Fallback: search the full output for binary keywords
  if (/\bbun\b/.test(output)) return "bun";
  if (/\btsx\b/.test(output)) return "tsx";
  if (/\bnode\b/.test(output)) return "node";
  if (/\bpython\b/.test(output)) return "python";

  // If output is empty (tsx can't resolve `just` from PATH in npx),
  // default to tsx since this project's `just dev` always runs tsx.
  return "tsx";
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * Options for preparing a Herdr workspace for e2e testing.
 */
export interface PrepareHerdrOptions {
  /** Unique label for the workspace (default: "nexus-e2e"). */
  workspaceLabel?: string;
  /** Maximum seconds to wait for the pane to become available (default 30). */
  maxWaitSeconds?: number;
  /** Agent name to use instead of generating a random one. */
  agentName?: string;
}

/**
 * Result of preparing a Herdr workspace.
 */
export interface PreparedHerdr {
  /** The workspace ID (e.g. "w42"). */
  workspaceId: string;
  /** The root pane ID (e.g. "w42:p1"). */
  rootPaneId: string;
  /** The agent name that was started (e.g. "agent-3a1f"). */
  agentName: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates a new Herdr workspace, waits 0.5s for the root pane, starts a
 * default agent with kind "mastracode", and returns workspace + pane +
 * agent identifiers. Mirrors the behavior of herdr-start-agent.sh.
 *
 * @param options Workspace label and optional max wait time.
 * @returns Handle containing workspaceId, rootPaneId, and agentName.
 */
export function prepareHerdr(options: PrepareHerdrOptions = {}): PreparedHerdr {
  const { workspaceLabel = "nexus-e2e", maxWaitSeconds = 30, agentName: providedAgentName } = options;

  // Step 1: Create workspace (no-focus to avoid stealing UI focus).
  const createData = runHerdr(["workspace", "create", "--label", workspaceLabel, "--no-focus"]);
  const workspaceId = drill(createData, "result", "workspace", "workspace_id");
  const rootPaneId = drill(createData, "result", "root_pane", "pane_id");

  if (!workspaceId || !rootPaneId) {
    throw new Error(`Failed to create workspace: ${JSON.stringify(createData)}`);
  }

  console.error(`  Workspace created: ${workspaceId} (label: ${workspaceLabel})`);
  console.error(`  Root pane: ${rootPaneId}`);

  // Step 2: Wait 0.5s for the root pane to become available (matches herdr-start-agent.sh).
  console.error(`  → Waiting 0.5s for root pane ${rootPaneId} to become available ...`);
  execSync("sleep 0.5", { stdio: "ignore" });
  console.error(`  ✓ Root pane ${rootPaneId} is ready`);

  // Step 3: Generate or use provided agent name, then start the agent (matches herdr-start-agent.sh).
  const randomHex = Buffer.from(crypto.getRandomValues(new Uint8Array(4))).toString("hex").slice(0, 4);
  const agentName = providedAgentName ?? `agent-${randomHex}`;

  console.error(`  → Starting agent '${agentName}' (kind: mastracode) in pane ${rootPaneId} ...`);
  const startResult = runHerdr(["agent", "start", agentName, "--kind", "mastracode", "--pane", rootPaneId]);

  const error = (startResult.error as Record<string, string>)?.code;
  if (error) {
    // Agent start failure is a catastrophic error — the agent never started.
    const message = (startResult.error as Record<string, string>)?.message ?? error;
    throw new Error(`FATAL: Agent start failed — ${message}`);
  } else {
    const name = drill(startResult, "result", "agent", "name") ?? agentName;
    console.error(`  ✓ Agent started: ${name}`);
  }

  return { workspaceId, rootPaneId, agentName };
}

/**
 * Starts an agent in a given pane and returns the agent name.
 * Uses kind "mastracode" directly — no PATH wrapper needed.
 *
 * @param paneId The pane ID to start the agent in.
 * @param maxWaitSeconds Maximum seconds to wait for agent readiness (default 60).
 * @returns The agent name.
 */
export function startHerdrAgent(
  paneId: string,
  { maxWaitSeconds = 60 }: { maxWaitSeconds?: number } = {},
): string {
  // Generate a random lowercase agent name matching [a-z][a-z0-9_-]{0,31}.
  const randomHex = Buffer.from(crypto.getRandomValues(new Uint8Array(4))).toString("hex").slice(0, 4);
  const agentName = `agent-${randomHex}`;

  console.error(`  Starting agent '${agentName}' (kind: mastracode) in pane ${paneId} ...`);

  const result = runHerdr(["agent", "start", agentName, "--kind", "mastracode", "--pane", paneId, "--timeout", String(maxWaitSeconds * 1000)]);

  const error = (result.error as Record<string, string>)?.code;
  if (error) {
    const message = (result.error as Record<string, string>)?.message ?? error;
    throw new Error(`Failed to start agent: ${message}`);
  }

  const name = drill(result, "result", "agent", "name") ?? agentName;
  console.error(`  ✓ Agent started: ${name}`);

  return name;
}

/**
 * Prompts an agent and waits for it to settle (idle/done/blocked).
 *
 * @param agentName The agent name to prompt.
 * @param promptText The text prompt to send.
 * @param timeoutMs Maximum milliseconds to wait (default 120_000).
 * @returns The agent state after the prompt settles.
 */
export function promptHerdrAgent(
  agentName: string,
  promptText: string,
  { timeoutMs = 120_000 }: { timeoutMs?: number } = {},
): Record<string, unknown> {
  console.error(`  → Prompting agent '${agentName}' ...`);

  const result = runHerdr(["agent", "prompt", agentName, promptText, "--wait", "--timeout", String(timeoutMs)]);
  return result;
}

/**
 * Closes a Herdr workspace, cleaning up all its panes and agents.
 *
 * @param workspaceId The workspace ID to close (e.g. "w42").
 */
export function closeHerdrWorkspace(workspaceId: string): void {
  try {
    runHerdr(["workspace", "close", workspaceId]);
    console.error(`  ✓ Workspace ${workspaceId} closed.`);
  } catch {
    // Ignore — workspace may already be closed.
  }
}
