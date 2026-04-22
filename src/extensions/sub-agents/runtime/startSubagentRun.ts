import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { SpawnSubagentOptions, SubagentRun } from "../types.js";
import { createRunTitle } from "./createRunTitle.js";
import { createSubagentRun } from "./createSubagentRun.js";
import { persistSubagentRun } from "./persistSubagentRun.js";
import { appendSubagentTranscriptEntry } from "./appendSubagentTranscriptEntry.js";
import { executeSubagentRun } from "./executeSubagentRun.js";
import { sharedSubagentRuntime } from "./sharedSubagentRuntime.js";
import { sharedSubagentScheduler } from "./sharedSubagentScheduler.js";
import type { SubagentContextProvider } from "../context-providers/types.js";

/**
 * Starts one child RPC subagent run and wires live state tracking.
 *
 * @param ctx Extension runtime context.
 * @param prompt User task prompt.
 * @param options Spawn options.
 * @param providers Available context providers.
 * @returns Tracked run state.
 */
export async function startSubagentRun(
  ctx: ExtensionContext,
  prompt: string,
  options: SpawnSubagentOptions,
  providers: SubagentContextProvider[],
): Promise<SubagentRun> {
  const run = createSubagentRun(
    prompt,
    {
      ...options,
      description: createRunTitle(options.description, prompt),
    },
    ctx.cwd,
  );
  run.contextProviderIds = options.contextProviders ?? (options.inheritContext ? ["parent-conversation", "project-context"] : []);
  appendSubagentTranscriptEntry(run, { role: "user", text: prompt.trim() });
  sharedSubagentRuntime.setRun(run);
  persistSubagentRun(run);

  const launchRun = async (): Promise<void> => {
    try {
      await executeSubagentRun(ctx, run, options, providers);
    } catch (error) {
      run.status = "error";
      run.lastError = error instanceof Error ? error.message : String(error);
      run.completedAt = Date.now();
      sharedSubagentRuntime.emit();
      persistSubagentRun(run);
      if (!run.background) throw error;
    }
  };

  if (run.background) {
    sharedSubagentScheduler.schedule(launchRun);
    return run;
  }

  await launchRun();
  return run;
}
