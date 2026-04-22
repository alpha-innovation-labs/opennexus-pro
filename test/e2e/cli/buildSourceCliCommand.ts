import { quoteShellArg } from "./quoteShellArg.js";

/**
 * Builds one shell command that launches the source Nexus CLI with the provided args.
 *
 * @param args CLI arguments.
 * @returns Shell command string.
 */
export function buildSourceCliCommand(args: readonly string[]): string {
  return ["./node_modules/.bin/tsx", "src/index.ts", ...args].map((value) => quoteShellArg(value)).join(" ");
}
