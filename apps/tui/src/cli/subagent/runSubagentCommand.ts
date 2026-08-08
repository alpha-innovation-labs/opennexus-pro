import { parseSubagentArgs } from "./parseSubagentArgs.js";
import { runSubagentStartCommand } from "./runSubagentStartCommand.js";
import { runSubagentSendCommand } from "./runSubagentSendCommand.js";
import { runSubagentSendKeysCommand } from "./runSubagentSendKeysCommand.js";
import { runSubagentReadCommand } from "./runSubagentReadCommand.js";

/**
 * Dispatches the subagent CLI command to the appropriate subcommand handler.
 *
 * Usage:
 *   nexus subagent start                          — split right + launch nexus
 *   nexus subagent send <pane-id> "<text>"        — send text to a pane
 *   nexus subagent send-keys <pane-id> <keys...>  — send key presses
 *   nexus subagent read <pane-id> [--lines N]     — read pane output
 *
 * @returns Process exit code.
 */
export async function runSubagentCommand(): Promise<number> {
  const { command, args, flags } = parseSubagentArgs();

  switch (command) {
    case "start":
      return runSubagentStartCommand();

    case "send": {
      const paneId = args[0];
      const text = args.slice(1).join(" ");
      if (!paneId || !text) {
        console.error('Usage: nexus subagent send <pane-id> "<text>"');
        return 1;
      }
      return runSubagentSendCommand(paneId, text);
    }

    case "send-keys": {
      const paneId = args[0];
      const keys = args.slice(1);
      if (!paneId || keys.length === 0) {
        console.error('Usage: nexus subagent send-keys <pane-id> <keys...>');
        return 1;
      }
      return runSubagentSendKeysCommand(paneId, keys);
    }

    case "read": {
      const paneId = args[0];
      return runSubagentReadCommand(paneId, {
        lines: flags.lines,
        source: flags.source,
      });
    }

    case "help":
    default:
      console.log(`
subagent — manage subagent panes.

Usage:
  nexus subagent start                          Split current pane right and launch nexus
  nexus subagent send <pane-id> "<text>" [--enter]  Send text + Enter
  nexus subagent send-keys <pane-id> <keys...>  Send key presses (e.g. Enter, Esc)
  nexus subagent read <pane-id> [--lines N]     Read pane terminal output
  nexus subagent help                           Show this message
`);
      return 0;
  }
}
