import type { PiPackagesCommandOptions } from "./PiPackagesCommandOptions";
import { isPiPackagesCommand } from "./isPiPackagesCommand";

/**
 * Parses nexus pi-packages subcommand options.
 *
 * Recognised subcommands: list, enable, disable.
 *
 * @param argv Raw CLI arguments.
 * @returns Parsed options, or undefined for another command.
 */
export function parsePiPackagesCommand(argv: readonly string[]): PiPackagesCommandOptions | undefined {
  if (!isPiPackagesCommand(argv)) return undefined;

  let subcommand: string | undefined;
  let source: string | undefined;
  let help = false;
  let invalidOption: string | undefined;
  let invalidArgument: string | undefined;

  for (const arg of argv.slice(1)) {
    if (arg === "-h" || arg === "--help") {
      help = true;
      continue;
    }
    if (arg.startsWith("-")) {
      invalidOption ??= arg;
      continue;
    }
    if (!subcommand) {
      subcommand = arg;
      continue;
    }
    if (!source) {
      source = arg;
      continue;
    }
    invalidArgument ??= arg;
  }

  return { source, subcommand, help, invalidOption, invalidArgument };
}
