import type { RpcClient } from "@earendil-works/pi-coding-agent";

export interface AnnotationAgentRuntime {
  client: RpcClient;
  busy: boolean;
}

export type AnnotationAgentEvent = {
  type?: string;
  assistantMessageEvent?: {
    type?: string;
    delta?: string;
  };
  message?: {
    role?: string;
    content?: Array<{ type?: string; text?: string }>;
    errorMessage?: string;
  };
  toolName?: string;
  args?: Record<string, unknown>;
  isError?: boolean;
  result?: {
    content?: Array<{ type?: string; text?: string }>;
  };
};
