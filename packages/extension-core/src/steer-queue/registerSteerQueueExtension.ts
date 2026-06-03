import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { getSteerQueuePath } from "./getSteerQueuePath.js";
import { readSteerQueuePollIntervalMs } from "./readSteerQueuePollIntervalMs.js";
import { startSteerQueuePolling, type SteerQueuePollingHandle } from "./startSteerQueuePolling.js";

/**
 * Registers the top-level Nexus steering queue extension.
 *
 * @param pi Pi extension API.
 */
export function registerSteerQueueExtension(pi: ExtensionAPI): void {
  logExtensionEvent("steer-queue", "init");
  let agentIdle = true;
  let pollingHandle: SteerQueuePollingHandle | undefined;

  pi.on("session_start", async (_event, ctx) => {
    pollingHandle?.stop();
    pollingHandle = startSteerQueuePolling(pi, getSteerQueuePath(ctx.sessionManager.getSessionId()), () => agentIdle, readSteerQueuePollIntervalMs());
  });

  pi.on("agent_start", async () => {
    agentIdle = false;
  });

  pi.on("agent_end", async () => {
    agentIdle = true;
  });

  pi.on("turn_end", async () => {
    agentIdle = true;
  });

  pi.on("session_shutdown", async () => {
    pollingHandle?.stop();
    pollingHandle = undefined;
  });
}
