/**
 * Herdr test preparation utilities.
 *
 * Creates a workspace, polls until the root pane is available, and returns
 * the workspace + pane identifiers so callers can start agents and run e2e
 * test commands inside that pane.
 */

import { execSync, spawnSync } from "node:child_process";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Runs a herdr CLI command and returns parsed JSON, or throws on failure.
 */
function runHerdr(args: string[], { timeoutMs = 10_000 }: { timeoutMs?: number } = {}): Record<string, unknown> {
  const result = spawnSync("herdr", args, {
    encoding: "utf-8",
    timeout: timeoutMs,
  });

  if (result.error) {
    throw new Error(`herdr ${args.join(" ")}: ${result.error.message}`);
  }

  const stderr = result.stderr?.toString()?.trim() ?? "";
  const stdout = result.stdout?.toString()?.trim() ?? "";

  // CLI errors write JSON to stderr; success writes JSON to stdout.
  const source = stderr.startsWith("{") ? stderr : stdout;

  if (!source) {
    throw new Error(`herdr ${args.join(" ")}: no output`);
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
function drill(data: Record<string, unknown>, ...keys: string[]): string | undefined {
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
 * Supported patterns: bun, tsx, node, npx, python.
 */
function resolveJustDevBinary(): string {
  let output: string;
  try {
    output = execSync("just -n dev", { encoding: "utf-8", timeout: 5000 });
  } catch {
    throw new Error("Could not run `just -n dev` — is just installed?");
  }

  if (output.includes("bun")) return "bun";
  if (output.includes("tsx")) return "tsx";
  if (output.includes("npx")) {
    const npxMatch = output.match(/npx\s+[^ ]*\s+(\S+)/);
    if (npxMatch && npxMatch[1].includes("tsx")) return "tsx";
    return "npx";
  }
  if (output.includes("node")) return "node";
  if (output.includes("python")) return "python";

  throw new Error(`Could not determine binary from \`just -n dev\`: ${output.slice(0, 200)}`);
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
}

/**
 * Result of preparing a Herdr workspace.
 */
export interface PreparedHerdr {
  /** The workspace ID (e.g. "w42"). */
  workspaceId: string;
  /** The root pane ID (e.g. "w42:p1"). */
  rootPaneId: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates a new Herdr workspace, polls until the root pane is available,
 * and returns the workspace + pane identifiers.
 *
 * Polls `herdr pane get` every 0.1s until `agent_status` is `"unknown"`
 * or `"idle"` (meaning the pane is at an interactive shell prompt).
 *
 * @param options Workspace label and optional max wait time.
 * @returns Handle containing workspaceId and rootPaneId.
 */
export function prepareHerdr(options: PrepareHerdrOptions = {}): PreparedHerdr {
  const { workspaceLabel = "nexus-e2e", maxWaitSeconds = 30 } = options;

  // Step 1: Create workspace (no-focus to avoid stealing UI focus).
  const createData = runHerdr(["workspace", "create", "--label", workspaceLabel, "--no-focus"]);
  const workspaceId = drill(createData, "result", "workspace", "workspace_id");
  const rootPaneId = drill(createData, "result", "root_pane", "pane_id");

  if (!workspaceId || !rootPaneId) {
    throw new Error(`Failed to create workspace: ${JSON.stringify(createData)}`);
  }

  console.error(`  Workspace created: ${workspaceId} (label: ${workspaceLabel})`);
  console.error(`  Root pane: ${rootPaneId}`);

  // Step 2: Poll until the root pane is available.
  const maxWait = maxWaitSeconds * 10; // count in 10ths of a second
  let elapsed = 0;

  console.error(`  → Waiting for pane ${rootPaneId} to become available ...`);

  while (elapsed < maxWait) {
    const statusData = runHerdr(["pane", "get", rootPaneId], { timeoutMs: 5_000 });
    const agentStatus = drill(statusData, "result", "pane", "agent_status");

    if (agentStatus === "unknown" || agentStatus === "idle") {
      const realSeconds = (elapsed / 10).toFixed(1);
      console.error(`  ✓ Pane ${rootPaneId} is available after ${realSeconds}s`);
      break;
    }

    elapsed += 1;
    execSync("sleep 0.1", { stdio: "ignore" });
  }

  if (elapsed >= maxWait) {
    throw new Error(`Pane ${rootPaneId} did not become available within ${maxWaitSeconds}s`);
  }

  return { workspaceId, rootPaneId };
}

/**
 * Starts an agent in a given pane and returns the agent name.
 *
 * Automatically detects what `just -n dev` resolves to, creates a temporary
 * wrapper so herdr's "pi" agent kind resolves to the correct binary, starts
 * the agent, then restores the original "pi" path.
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

  // Resolve the binary that `just dev` actually runs.
  const realBinary = resolveJustDevBinary();
  console.error(`  Detected binary: ${realBinary}`);

  // Save the current "pi" path so we can restore it.
  let originalPiPath: string | undefined;
  try {
    originalPiPath = execSync("which pi", { encoding: "utf-8" }).trim();
  } catch {
    /* no "pi" on PATH — nothing to restore */
  }

  // Create a temporary wrapper script that calls the real binary.
  const wrapperDir = execSync("mktemp -d", { encoding: "utf-8" }).trim();
  const wrapperScript = `${wrapperDir}/pi-wrapper`;
  const wrapperContent = `#!/usr/bin/env bash\nexec ${realBinary} "$@"`;
  execSync(`cat > "${wrapperScript}" <<'EOF'\n${wrapperContent}\nEOF`, { stdio: "ignore" });
  execSync(`chmod +x "${wrapperScript}"`, { stdio: "ignore" });

  // Temporarily prepend the wrapper dir to PATH so "pi" resolves to our wrapper.
  const originalPath = process.env.PATH ?? "";
  process.env.PATH = `${wrapperDir}:${originalPath}`;

  console.error(`  Starting agent '${agentName}' (kind: pi) in pane ${paneId} ...`);

  const result = runHerdr(["agent", "start", agentName, "--kind", "pi", "--pane", paneId, "--timeout", String(maxWaitSeconds * 1000)]);

  const error = (result.error as Record<string, string>)?.code;
  if (error) {
    // Clean up wrapper before exiting.
    process.env.PATH = originalPath;
    try { execSync(`rm -rf "${wrapperDir}"`, { stdio: "ignore" }); } catch { /* ignore */ }
    const message = (result.error as Record<string, string>)?.message ?? error;
    throw new Error(`Failed to start agent: ${message}`);
  }

  const name = drill(result, "result", "agent", "name") ?? agentName;
  console.error(`  ✓ Agent started: ${name}`);

  // Restore original "pi" path.
  process.env.PATH = originalPath;
  try { execSync(`rm -rf "${wrapperDir}"`, { stdio: "ignore" }); } catch { /* ignore */ }
  if (originalPiPath) {
    console.error(`  Restored original 'pi' path: ${originalPiPath}`);
  } else {
    console.error(`  No original 'pi' — cleaned up wrapper.`);
  }

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
