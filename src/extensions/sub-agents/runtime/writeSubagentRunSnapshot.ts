import { writeFile } from "node:fs/promises";
import type { SubagentRun } from "../types.js";
import { getSubagentRunFilePath } from "./getSubagentRunFilePath.js";

/**
 * Persists a serializable snapshot of one run for background inspection.
 *
 * @param run Target run.
 */
export async function writeSubagentRunSnapshot(run: SubagentRun): Promise<void> {
  const snapshot = {
    id: run.id,
    title: run.title,
    prompt: run.prompt,
    cwd: run.cwd,
    subagentType: run.subagentType,
    status: run.status,
    background: run.background,
    createdAt: run.createdAt,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    lastError: run.lastError,
    resultText: run.resultText,
    liveAssistantText: run.liveAssistantText,
    liveThinkingText: run.liveThinkingText,
    activeTool: run.activeTool,
    transcript: run.transcript,
    toolCalls: run.toolCalls,
    contextProviderIds: run.contextProviderIds,
  };
  await writeFile(getSubagentRunFilePath(run.id), JSON.stringify(snapshot, null, 2));
}
