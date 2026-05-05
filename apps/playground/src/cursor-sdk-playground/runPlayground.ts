import { createPlaygroundAgent } from "./createPlaygroundAgent.js";
import { getCursorApiKey } from "./getCursorApiKey.js";
import { readPromptArgs } from "./readPromptArgs.js";
import { streamRunOutput } from "./streamRunOutput.js";

/**
 * Runs a one-prompt Cursor SDK playground against the current workspace.
 *
 * @param args Command-line prompt arguments.
 */
export async function runPlayground(args: string[]): Promise<void> {
  const prompt = readPromptArgs(args);
  const agent = await createPlaygroundAgent(getCursorApiKey(), process.cwd());

  try {
    process.stdout.write(`[cursor-sdk] prompt=${prompt}\n\n`);
    const run = await agent.send(prompt);
    await streamRunOutput(run);
  } finally {
    await agent[Symbol.asyncDispose]();
  }
}
