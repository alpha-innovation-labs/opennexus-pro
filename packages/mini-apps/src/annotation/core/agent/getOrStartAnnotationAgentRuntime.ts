import { annotationAgentRuntimes } from "./annotationAgentRuntimes.js";
import { createAnnotationRpcClient } from "./createAnnotationRpcClient.js";
import { recordAnnotationAgentEvent } from "./recordAnnotationAgentEvent.js";
import type { AnnotationAgentEvent, AnnotationAgentRuntime } from "./types.js";

/**
 * Starts or returns the real Nexus runtime for an annotation conversation.
 *
 * @param conversationId Annotation conversation id.
 * @param workspaceDir Project directory where Nexus runs.
 * @returns Running annotation agent runtime.
 */
export async function getOrStartAnnotationAgentRuntime(
  conversationId: string,
  workspaceDir: string,
): Promise<AnnotationAgentRuntime> {
  const existing = annotationAgentRuntimes.get(conversationId);
  if (existing) return existing;

  const runtime: AnnotationAgentRuntime = { client: createAnnotationRpcClient(workspaceDir), busy: false };
  runtime.client.onEvent((event) => {
    const typed = event as AnnotationAgentEvent;
    if (typed.type === "agent_start") runtime.busy = true;
    if (typed.type === "agent_end") runtime.busy = false;
    void recordAnnotationAgentEvent(conversationId, typed);
  });
  await runtime.client.start();
  annotationAgentRuntimes.set(conversationId, runtime);
  return runtime;
}
