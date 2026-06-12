import { getBundledCommandsPath } from "@nexus/assets/commands/getBundledCommandsPath.js";
import { getBundledThemesPath } from "@nexus/assets/themes/getBundledThemesPath.js";
import { getUserCommandsPath, userCommandsExists } from "@nexus/runtime/config/getUserCommandsPath.js";
import { filterVerboseStartupArg } from "./filterVerboseStartupArg.js";
import { addBaseSystemPromptArg } from "./system-prompt/addBaseSystemPromptArg.js";

/**
 * Creates the CLI arguments for the bundled Pi app.
 *
 * @param inputArgs Raw arguments passed to the app.
 * @returns Arguments with bundled runtime resources configured.
 */
export function createAppArgs(inputArgs: string[]): string[] {
  const args = filterVerboseStartupArg(addBaseSystemPromptArg([...inputArgs]));
  const bundledThemesPath = getBundledThemesPath();
  const bundledCommandsPath = getBundledCommandsPath();
  const userCommandsPath = getUserCommandsPath();

  let hasBundledThemePath = false;
  let hasBundledCommandsPath = false;
  let hasNoPromptTemplates = false;

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--theme" && args[index + 1] === bundledThemesPath) {
      hasBundledThemePath = true;
    }
    if (args[index] === "--prompt-template" && args[index + 1] === bundledCommandsPath) {
      hasBundledCommandsPath = true;
    }
    if (args[index] === "--no-prompt-templates" || args[index] === "-np") {
      hasNoPromptTemplates = true;
    }
  }

  const prependedArgs: string[] = [];
  if (!hasBundledThemePath) prependedArgs.push("--theme", bundledThemesPath);
  // User commands are injected before bundled commands so they shadow
  // bundled commands by name (Pi's expandPromptTemplate uses .find()).
  if (userCommandsExists(userCommandsPath) && !hasNoPromptTemplates) {
    prependedArgs.push("--prompt-template", userCommandsPath);
  }
  if (!hasBundledCommandsPath) prependedArgs.push("--prompt-template", bundledCommandsPath);

  return [...prependedArgs, ...args];
}
