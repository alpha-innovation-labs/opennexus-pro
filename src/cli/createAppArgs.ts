import { addBaseSystemPromptArg } from "./system-prompt/addBaseSystemPromptArg.js";
import { getBundledThemesPath } from "../themes/getBundledThemesPath.js";

/**
 * Creates the CLI arguments for the bundled Pi app.
 *
 * @param inputArgs Raw arguments passed to the app.
 * @returns Arguments with bundled runtime resources configured.
 */
export function createAppArgs(inputArgs: string[]): string[] {
  const args = addBaseSystemPromptArg([...inputArgs]);
  const bundledThemesPath = getBundledThemesPath();

  if (!args.includes("--no-extensions")) {
    args.unshift("--no-extensions");
  }

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--theme" && args[index + 1] === bundledThemesPath) {
      return args;
    }
  }

  return ["--theme", bundledThemesPath, ...args];
}
