import { createSummarizerArgs } from "./createSummarizerArgs.js";
import { getCurrentNexusLaunchSpec } from "@nexus/runtime/cli/getCurrentNexusLaunchSpec.js";
import { runBundledChildProcess } from "./runBundledChildProcess.js";

/**
 * Runs a generic child process with the given prompt and returns stdout.
 *
 * Import this file as `runChild` and pass parameters — no child process
 * boilerplate needed. This is the single entry point for all child-process
 * calls that need an LLM.
 *
 * @param cwd Working directory for the child process.
 * @param prompt Prompt text to send to the child.
 * @returns Raw child process output.
 */
export async function runChild(cwd: string, prompt: string): Promise<string> {
  const args = createSummarizerArgs(prompt);
  const launchSpec = getCurrentNexusLaunchSpec(args);
  const { command, args: launchArgs } = launchSpec;
  const { stdout, stderr, code } = await runBundledChildProcess({
    command,
    args: launchArgs,
    cwd,
  });
  if (code !== 0) return "";
  if (stderr.trim()) return "";
  return stdout;
}
