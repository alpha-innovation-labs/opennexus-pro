import type { RpcClient } from "@mariozechner/pi-coding-agent";

/**
 * One transcript entry captured from a child subagent run.
 */
export type SubagentTranscriptEntry = {
  role: "user" | "assistant" | "tool" | "error" | "thinking" | "system";
  text: string;
  createdAt: number;
  toolCallId?: string;
  toolName?: string;
  args?: Record<string, unknown>;
  result?: {
    isError: boolean;
    content?: unknown;
    details?: unknown;
  };
};

/**
 * One live tool execution tracked for a child subagent run.
 */
export type SubagentToolState = {
  toolName: string;
  args?: Record<string, unknown>;
  outputText: string;
  startedAt: number;
  finishedAt?: number;
};

/**
 * Mutable runtime state for one spawned subagent run.
 */
export type SubagentRun = {
  id: string;
  title: string;
  prompt: string;
  cwd: string;
  subagentType: string;
  status: "queued" | "running" | "completed" | "error" | "aborted";
  background: boolean;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  lastError?: string;
  resultText: string;
  liveAssistantText: string;
  liveThinkingText: string;
  activeTool: SubagentToolState | null;
  transcript: SubagentTranscriptEntry[];
  client: RpcClient | null;
  toolCalls: number;
  contextProviderIds: string[];
};

/**
 * Options accepted by the public Agent tool.
 */
export type SpawnSubagentOptions = {
  description: string;
  subagentType: string;
  model?: string;
  thinking?: string;
  maxTurns?: number;
  runInBackground?: boolean;
  inheritContext?: boolean;
  isolated?: boolean;
  contextProviders?: string[];
};
