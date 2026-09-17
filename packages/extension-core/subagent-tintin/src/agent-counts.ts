import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { AgentManager } from "./agent-manager.js";

/** Optional consumers use this session-scoped bus protocol, not fleet/footer text. */
export function publishAgentCounts(
  events: ExtensionAPI["events"],
  manager: Pick<AgentManager, "getAgentCounts" | "subscribeAgentCounts">,
  sessionId: string,
): () => void {
  let disposed = false;
  const publish = (counts = manager.getAgentCounts()) => {
    if (disposed) return;
    events.emit("subagents:counts", { sessionId, ...counts });
  };
  const unsubscribeRequest = events.on("subagents:counts:request", (data: unknown) => {
    if ((data as { sessionId?: string } | null)?.sessionId === sessionId) publish();
  });
  const unsubscribeCounts = manager.subscribeAgentCounts(publish);
  return () => {
    if (disposed) return;
    unsubscribeRequest();
    unsubscribeCounts();
    publish({ running: 0, queued: 0 });
    disposed = true;
  };
}
