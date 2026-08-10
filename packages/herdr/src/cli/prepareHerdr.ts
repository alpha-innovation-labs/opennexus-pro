#!/usr/bin/env node
/**
 * CLI entrypoint for Herdr workspace preparation.
 *
 * Usage:
 *   just agent-e2e setup                          — create workspace + wait for pane
 *   just agent-e2e setup --label my-workspace     — custom label
 *   just agent-e2e start <paneId>                 — start an agent in a pane
 *   just agent-e2e prompt <agentName> "<prompt>"   — prompt an agent
 *   just agent-e2e send-keys <agentName> <keys>    — send key presses to an agent
 *   just agent-e2e read <agentName> [--lines N]    — read agent terminal output
 *   just agent-e2e close <workspaceId>             — close a workspace
 *   just agent-e2e full --label my-workspace       — setup + start + prompt in one shot
 *
 * This is the invokable bridge: tests import from @nexus/herdr, agents call
 * `just agent-e2e` directly.
 */

import {
  prepareHerdr,
  startHerdrAgent,
  promptHerdrAgent,
  closeHerdrWorkspace,
  runHerdr,
  PreparedHerdr,
} from "../index";

// ---------------------------------------------------------------------------
// Argument parsing (minimal, no dependencies)
// ---------------------------------------------------------------------------

/**
 * Parse CLI arguments. Handles two invocation modes:
 *
 * 1. Direct Node: `node cli/prepareHerdr.ts setup --label foo`
 *    — argv[2+] are individual tokens.
 * 2. Via `[positional-arguments]` + `"$@"` in just:
 *    — all args are concatenated into argv[2] as a single string
 *      e.g. `"setup --label foo --maxWait 30"`.
 */
function parseArgs(): { command: string; args: string[]; flags: Record<string, string> } {
  const raw = process.argv.slice(2);

  // If there's only one token and it contains spaces, it was forwarded
  // via just's [positional-arguments] + "$@" — split it back out.
  let tokens: string[];
  if (raw.length === 1 && raw[0].includes(" ")) {
    tokens = raw[0].split(/\s+/);
  } else {
    tokens = raw;
  }

  const command = tokens[0] ?? "help";
  const rest = tokens.slice(1);
  const args: string[] = [];
  const flags: Record<string, string> = {};

  for (let i = 0; i < rest.length; i++) {
    if (rest[i].startsWith("--")) {
      const key = rest[i].slice(2);
      const next = rest[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = "true";
      }
    } else {
      args.push(rest[i]);
    }
  }

  return { command, args, flags };
}

// ---------------------------------------------------------------------------
// Command handlers
// ---------------------------------------------------------------------------

function cmdSetup(flags: Record<string, string>): PreparedHerdr {
  return prepareHerdr({
    workspaceLabel: flags.label,
    maxWaitSeconds: flags.maxWait ? parseInt(flags.maxWait, 10) : undefined,
    agentName: flags.agentName,
  });
}

function cmdStart(paneId: string, flags: Record<string, string>): string {
  return startHerdrAgent(paneId, {
    maxWaitSeconds: flags.maxWait ? parseInt(flags.maxWait, 10) : undefined,
  });
}

function cmdPrompt(agentName: string, promptText: string, flags: Record<string, string>): Record<string, unknown> {
  return promptHerdrAgent(agentName, promptText, {
    timeoutMs: flags.timeout ? parseInt(flags.timeout, 10) : undefined,
  });
}

/**
 * Send key presses to an agent via `herdr agent send-keys`.
 * Keys are space-separated: "Enter", "a b c", "Esc Ctrl+c".
 */
function cmdSendKeys(agentName: string, keys: string[]): Record<string, unknown> {
  console.error(`  → Sending keys to agent '${agentName}' ...`);

  const result = runHerdr(["agent", "send-keys", agentName, ...keys]);
  console.error(`  ✓ Keys sent to ${agentName}.`);
  return result;
}

/**
 * Read agent terminal output via `herdr agent read`.
 */
function cmdRead(agentName: string, { lines = 50 }: { lines?: number }): Record<string, unknown> {
  console.error(`  → Reading agent '${agentName}' (last ${lines} lines) ...`);

  const result = runHerdr(["agent", "read", agentName, "--source", "recent", "--lines", String(lines)]);
  return result;
}

function cmdClose(workspaceId: string): void {
  closeHerdrWorkspace(workspaceId);
}

/**
 * Runs the full lifecycle: setup → start → prompt → print agent output.
 */
function cmdFull(flags: Record<string, string>): void {
  const { workspaceId, rootPaneId, agentName } = cmdSetup(flags);
  const promptText = flags.prompt ?? "tell me a joke";
  const result = cmdPrompt(agentName, promptText, flags);

  console.error("\n  Full lifecycle complete:");
  console.error(`    Workspace : ${workspaceId}`);
  console.error(`    Pane      : ${rootPaneId}`);
  console.error(`    Agent     : ${agentName}`);
  console.error(`    Prompt    : ${promptText}`);
  console.error(`    Result    : ${JSON.stringify(result).slice(0, 300)}`);
}

function cmdHelp(): void {
  console.log(`
Herdr CLI — workspace preparation and agent management.

Usage:
  just agent-e2e setup [--label LABEL] [--agentName NAME] [--maxWait SECONDS]
    Create a workspace, wait 0.5s, and start a default agent (kind: mastracode).

  just agent-e2e start <paneId> [--maxWait SECONDS]
    Start a new agent in the given pane (separate from setup).

  just agent-e2e prompt <agentName> "<prompt>" [--timeout MS]
    Send a prompt to an agent and wait for it to settle.

  just agent-e2e send-keys <agentName> <keys...>
    Send key presses to an agent (space-separated: "Enter", "Esc", "Ctrl+c").

  just agent-e2e read <agentName> [--lines N]
    Read agent terminal output (default: last 50 lines).

  just agent-e2e close <workspaceId>
    Close a workspace and clean up.

  just agent-e2e full [--label LABEL] [--maxWait SECONDS] [--prompt TEXT] [--timeout MS]
    Run the full lifecycle: setup → start → prompt → print summary.

  just agent-e2e help
    Show this message.
`);
}



// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const { command, args, flags } = parseArgs();

switch (command) {
  case "setup":
    if (args.length > 0) {
      console.error("Error: 'setup' takes no positional arguments.");
      process.exit(1);
    }
    const result = cmdSetup(flags);
    console.error(`  Agent name: ${result.agentName}`);
    break;

  case "start": {
    const paneId = args[0];
    if (!paneId) {
      console.error("Error: 'start' requires a <paneId> argument.");
      process.exit(1);
    }
    const agentName = startHerdrAgent(paneId, {
      maxWaitSeconds: flags.maxWait ? parseInt(flags.maxWait, 10) : undefined,
    });
    console.error(`  Agent name: ${agentName}`);
    break;
  }

  case "prompt": {
    const agentName = args[0];
    const promptText = args[1];
    if (!agentName || !promptText) {
      console.error("Error: 'prompt' requires <agentName> and '<prompt>' arguments.");
      process.exit(1);
    }
    cmdPrompt(agentName, promptText, flags);
    break;
  }

  case "send-keys": {
    const agentName = args[0];
    const keys = args.slice(1);
    if (!agentName || keys.length === 0) {
      console.error("Error: 'send-keys' requires <agentName> and <keys...> arguments.");
      process.exit(1);
    }
    cmdSendKeys(agentName, keys);
    break;
  }

  case "read": {
    const agentName = args[0];
    if (!agentName) {
      console.error("Error: 'read' requires <agentName> argument.");
      process.exit(1);
    }
    const result = cmdRead(agentName, { lines: flags.lines ? parseInt(flags.lines, 10) : 50 });
    if (result._raw) {
      console.log(result._raw);
    }
    break;
  }

  case "close": {
    const workspaceId = args[0];
    if (!workspaceId) {
      console.error("Error: 'close' requires a <workspaceId> argument.");
      process.exit(1);
    }
    cmdClose(workspaceId);
    break;
  }

  case "full":
    cmdFull(flags);
    break;

  case "help":
  default:
    cmdHelp();
    break;
}
