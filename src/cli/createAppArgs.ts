import { getBundledCommandsPath } from "../commands/getBundledCommandsPath.js";
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
  const bundledCommandsPath = getBundledCommandsPath();

  if (!args.includes("--no-extensions")) {
    args.unshift("--no-extensions");
  }

  let hasBundledThemePath = false;
  let hasBundledCommandsPath = false;

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--theme" && args[index + 1] === bundledThemesPath) {
      hasBundledThemePath = true;
    }
    if (args[index] === "--prompt-template" && args[index + 1] === bundledCommandsPath) {
      hasBundledCommandsPath = true;
    }
  }

  const prependedArgs: string[] = [];
  if (!hasBundledThemePath) prependedArgs.push("--theme", bundledThemesPath);
  if (!hasBundledCommandsPath) prependedArgs.push("--prompt-template", bundledCommandsPath);

  return [...prependedArgs, ...args];
}
