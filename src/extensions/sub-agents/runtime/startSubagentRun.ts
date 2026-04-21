import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createSubagentRpcClient } from "../rpc/createSubagentRpcClient.js";
import type { SpawnSubagentOptions, SubagentRun } from "../types.js";
import { buildAgentInstructionBlock } from "./buildAgentInstructionBlock.js";
import { buildSubagentPrompt } from "./buildSubagentPrompt.js";
import { createRunTitle } from "./createRunTitle.js";
import { createSubagentRun } from "./createSubagentRun.js";
import { persistSubagentRun } from "./persistSubagentRun.js";
import { appendSubagentTranscriptEntry } from "./appendSubagentTranscriptEntry.js";
import { applySubagentEvent } from "./applySubagentEvent.js";
import { resolveContextProviders } from "./resolveContextProviders.js";
import { sharedSubagentRuntime } from "./sharedSubagentRuntime.js";
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
  const providerIds = options.contextProviders ?? (options.inheritContext ? ["parent-conversation"] : []);
  run.contextProviderIds = providerIds;
  appendSubagentTranscriptEntry(run, { role: "user", text: prompt.trim() });
  sharedSubagentRuntime.setRun(run);
  persistSubagentRun(run);

  const contextBlock = await resolveContextProviders(ctx, providerIds, providers);
  const instructionBlock = buildAgentInstructionBlock(options.subagentType);
  const fullPrompt = buildSubagentPrompt([instructionBlock, contextBlock].filter(Boolean).join("\n\n---\n\n"), prompt);

  const client = createSubagentRpcClient(ctx, options.model);
  run.client = client;
  if (options.thinking && "setThinkingLevel" in client) {
    try {
      await client.start();
      await client.setThinkingLevel(options.thinking as any);
    } catch (error) {
      run.status = "error";
      run.lastError = error instanceof Error ? error.message : String(error);
      sharedSubagentRuntime.emit();
      persistSubagentRun(run);
      throw error;
    }
  } else {
    await client.start();
  }

  await client.setSessionName(run.title);

  client.onEvent((event) => {
    applySubagentEvent(run, event);
    sharedSubagentRuntime.emit();
    persistSubagentRun(run);
  });

  try {
    await client.prompt(fullPrompt);
    if (!run.background) {
      await client.waitForIdle(300000);
    }
  } catch (error) {
    run.status = "error";
    run.lastError = error instanceof Error ? error.message : String(error);
    run.completedAt = Date.now();
    sharedSubagentRuntime.emit();
    persistSubagentRun(run);
    throw error;
  }

  sharedSubagentRuntime.emit();
  persistSubagentRun(run);
  return run;
}
