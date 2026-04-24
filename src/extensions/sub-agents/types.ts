import type { AgentSession, RpcClient } from "@mariozechner/pi-coding-agent";

/**
 * Supported subagent thinking levels.
 */
export type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh";

/**
 * One subagent type name.
 */
export type SubagentType = string;

/**
 * One available memory scope for persistent agent memory.
 */
export type MemoryScope = "user" | "project" | "local";

/**
 * One available execution isolation mode.
 */
export type IsolationMode = "worktree";

/**
 * One supported join mode for grouped agent execution.
 */
export type JoinMode = "async" | "group" | "smart";

/**
 * One bundled or user-defined agent configuration.
 */
export interface AgentConfig {
  name: string;
  displayName?: string;
  description: string;
  builtinToolNames?: string[];
  disallowedTools?: string[];
  extensions: true | string[] | false;
  skills: true | string[] | false;
  model?: string;
  thinking?: ThinkingLevel;
  maxTurns?: number;
  systemPrompt: string;
  promptMode: "replace" | "append";
  inheritContext?: boolean;
  runInBackground?: boolean;
  isolated?: boolean;
  memory?: MemoryScope;
  isolation?: IsolationMode;
  isDefault?: boolean;
  enabled?: boolean;
  source?: "builtin" | "project" | "global";
}

/**
 * Runtime environment details injected into agent prompts.
 */
export interface EnvInfo {
  isGitRepo: boolean;
  branch: string;
  platform: string;
}

/**
 * One agent record tracked by the legacy manager/UI path.
 */
export interface AgentRecord {
  id: string;
  type: SubagentType;
  description: string;
  status: "queued" | "running" | "completed" | "steered" | "aborted" | "stopped" | "error";
  result?: string;
  error?: string;
  toolUses: number;
  startedAt: number;
  completedAt?: number;
  session?: AgentSession;
  abortController?: AbortController;
  promise?: Promise<string>;
  groupId?: string;
  joinMode?: JoinMode;
  resultConsumed?: boolean;
  pendingSteers?: string[];
  worktree?: { path: string; branch: string };
  worktreeResult?: { hasChanges: boolean; branch?: string };
  toolCallId?: string;
  outputFile?: string;
  outputCleanup?: () => void;
}

/**
 * Custom notification payload used by the legacy agent UI.
 */
export interface NotificationDetails {
  id: string;
  description: string;
  status: string;
  toolUses: number;
  turnCount: number;
  maxTurns?: number;
  totalTokens: number;
  durationMs: number;
  outputFile?: string;
  error?: string;
  resultPreview: string;
  others?: NotificationDetails[];
}

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
  parentSessionFile?: string;
  pendingSteers?: string[];
  mode?: string;
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
  mode?: string;
  brief?: string;
};
