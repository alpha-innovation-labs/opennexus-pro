import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createSubagentRpcClient } from "../rpc/createSubagentRpcClient.js";
import type { SpawnSubagentOptions, SubagentRun } from "../types.js";
import type { SubagentContextProvider } from "../context-providers/types.js";
import { applySubagentEvent } from "./applySubagentEvent.js";
import { buildAgentInstructionBlock } from "./buildAgentInstructionBlock.js";
import { buildSubagentPrompt } from "./buildSubagentPrompt.js";
import { persistSubagentRun } from "./persistSubagentRun.js";
import { resolveContextProviders } from "./resolveContextProviders.js";
import { sharedSubagentRuntime } from "./sharedSubagentRuntime.js";

/**
 * Executes one prepared subagent run until launch completion or idle.
 *
 * @param ctx Extension runtime context.
 * @param run Mutable run state.
 * @param options Spawn options.
 * @param providers Available context providers.
 */
export async function executeSubagentRun(
  ctx: ExtensionContext,
  run: SubagentRun,
  options: SpawnSubagentOptions,
  providers: SubagentContextProvider[],
): Promise<void> {
  const providerIds = options.contextProviders ?? (options.inheritContext ? ["parent-conversation", "project-context"] : []);
  run.contextProviderIds = providerIds;

  const contextBlock = await resolveContextProviders(ctx, providerIds, providers);
  const instructionBlock = buildAgentInstructionBlock(options.subagentType);
  const fullPrompt = buildSubagentPrompt([instructionBlock, contextBlock].filter(Boolean).join("\n\n---\n\n"), run.prompt);

  const client = createSubagentRpcClient(ctx, options.model);
  run.client = client;
  run.status = "running";
  run.startedAt = Date.now();
  sharedSubagentRuntime.emit();
  persistSubagentRun(run);

  if (options.thinking && "setThinkingLevel" in client) {
    await client.start();
    await client.setThinkingLevel(options.thinking as never);
  } else {
    await client.start();
  }

  await client.setSessionName(run.title);

  client.onEvent((event) => {
    applySubagentEvent(run, event);
    sharedSubagentRuntime.emit();
    persistSubagentRun(run);
  });

  await client.prompt(fullPrompt);

  if (run.pendingSteers?.length) {
    for (const message of run.pendingSteers) {
      await client.steer(message);
    }
    run.pendingSteers = [];
  }

  if (!run.background) {
    await client.waitForIdle(300000);
  }

  sharedSubagentRuntime.emit();
  persistSubagentRun(run);
}
