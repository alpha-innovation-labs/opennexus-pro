import { parseSubagentArgs } from "./parseSubagentArgs.js";
import { runSubagentStartCommand } from "./runSubagentStartCommand.js";
import { runSubagentPromptCommand } from "./runSubagentPromptCommand.js";
import { runSubagentSendCommand } from "./runSubagentSendCommand.js";
import { runSubagentSendKeysCommand } from "./runSubagentSendKeysCommand.js";
import { runSubagentReadCommand } from "./runSubagentReadCommand.js";

/**
 * Dispatches the subagent CLI command to the appropriate subcommand handler.
 *
 * Usage:
 *   nexus subagent start [--session <name>]       — split right + start mastracode agent
 *   nexus subagent prompt <agent-name> "<text>"   — prompt agent + wait for response
 *   nexus subagent send <agent-name> "<text>"     — send text to an agent
 *   nexus subagent send-keys <agent-name> <keys...>  — send key presses
 *   nexus subagent read <agent-name> [--lines N]  — read agent output
 *
 * @returns Process exit code.
 */
export async function runSubagentCommand(): Promise<number> {
  const { command, args, flags } = parseSubagentArgs();

  switch (command) {
    case "start": {
      const sessionName = flags.session;
      return runSubagentStartCommand(sessionName);
    }

    case "prompt": {
      const agentName = args[0];
      const text = args.slice(1).join(" ");
      if (!agentName || !text) {
        console.error('Usage: nexus subagent prompt <agent-name> "<text>"');
        return 1;
      }
      return runSubagentPromptCommand(agentName, text, flags.timeout ? parseInt(flags.timeout, 10) : undefined);
    }

    case "send": {
      const agentName = args[0];
      const text = args.slice(1).join(" ");
      if (!agentName || !text) {
        console.error('Usage: nexus subagent send <agent-name> "<text>"');
        return 1;
      }
      return runSubagentSendCommand(agentName, text);
    }

    case "send-keys": {
      const agentName = args[0];
      const keys = args.slice(1);
      if (!agentName || keys.length === 0) {
        console.error('Usage: nexus subagent send-keys <agent-name> <keys...>');
        return 1;
      }
      return runSubagentSendKeysCommand(agentName, keys);
    }

    case "read": {
      const agentName = args[0];
      return runSubagentReadCommand(agentName, {
        lines: flags.lines,
        source: flags.source,
      });
    }

    case "help":
    default:
      console.log(`
subagent — manage subagent agents.

Usage:
  nexus subagent start [--session <name>]            Split current pane right and start mastracode agent
  nexus subagent prompt <agent-name> "<text>"        Prompt agent and wait for response
  nexus subagent send <agent-name> "<text>"          Send text + Enter to agent
  nexus subagent send-keys <agent-name> <keys...>    Send key presses (e.g. Enter, Esc)
  nexus subagent read <agent-name> [--lines N]       Read agent terminal output
  nexus subagent help                                Show this message
`);
      return 0;
  }
}
