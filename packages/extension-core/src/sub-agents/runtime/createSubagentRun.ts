import type { SpawnSubagentOptions, SubagentRun } from "../types.js";
import { createSubagentRunId } from "./createSubagentRunId.js";

/**
 * Creates initial mutable state for one subagent run.
 *
 * @param prompt Prompt sent to the child agent.
 * @param options Spawn options.
 * @param cwd Working directory inherited by the child run.
 * @returns Initialized subagent run state.
 */
export function createSubagentRun(prompt: string, options: SpawnSubagentOptions, cwd: string): SubagentRun {
  return {
    id: createSubagentRunId(),
    title: options.description,
    prompt,
    cwd,
    subagentType: options.subagentType,
    status: options.runInBackground ? "queued" : "running",
    background: Boolean(options.runInBackground),
    createdAt: Date.now(),
    resultText: "",
    liveAssistantText: "",
    liveThinkingText: "",
    activeTool: null,
    transcript: [],
    client: null,
    toolCalls: 0,
    contextProviderIds: options.contextProviders ?? [],
    mode: options.mode,
  };
}
