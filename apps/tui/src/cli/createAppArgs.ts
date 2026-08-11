import { getBundledCommandsPath } from "@nexus/runtime/config/getBundledCommandsPath";
import { getAgentCommandsPath, agentCommandsExists } from "@nexus/runtime/config/getAgentCommandsPath";
import { getUserCommandsPath, userCommandsExists } from "@nexus/runtime/config/getUserCommandsPath";
import { filterVerboseStartupArg } from "./filterVerboseStartupArg";
import { addBaseSystemPromptArg } from "./system-prompt/addBaseSystemPromptArg";

/**
 * Creates the CLI arguments for the bundled Pi app.
 *
 * @param inputArgs Raw arguments passed to the app.
 * @returns Arguments with bundled runtime resources configured.
 */
export function createAppArgs(inputArgs: string[]): string[] {
  const args = filterVerboseStartupArg(addBaseSystemPromptArg([...inputArgs]));
  const bundledCommandsPath = getBundledCommandsPath();
  const agentCommandsPath = getAgentCommandsPath();
  const userCommandsPath = getUserCommandsPath();

  let hasBundledCommandsPath = false;
  let hasNoPromptTemplates = false;

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--prompt-template" && args[index + 1] === bundledCommandsPath) {
      hasBundledCommandsPath = true;
    }
    if (args[index] === "--no-prompt-templates" || args[index] === "-np") {
      hasNoPromptTemplates = true;
    }
  }

  const prependedArgs: string[] = [];
  // Themes are now discovered natively from agentDir/.themes/ — no --theme
  // injection needed. The --no-themes flag still works as Pi's built-in
  // mechanism to disable theme loading.
  // Commands are injected in priority order (first match wins).
  // User commands shadow agent commands shadow bundled commands.
  if (userCommandsExists() && !hasNoPromptTemplates) {
    prependedArgs.push("--prompt-template", userCommandsPath);
  }
  if (agentCommandsExists() && !hasNoPromptTemplates) {
    prependedArgs.push("--prompt-template", agentCommandsPath);
  }
  if (!hasBundledCommandsPath) prependedArgs.push("--prompt-template", bundledCommandsPath);

  return [...prependedArgs, ...args];
}
