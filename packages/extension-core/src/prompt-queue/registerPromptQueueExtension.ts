import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { getPromptlineConfig } from "../neo-editor/features/promptline/config/getPromptlineConfig.js";
import { refreshPromptlineConfig } from "../neo-editor/features/promptline/config/refreshPromptlineConfig.js";
import { refreshAndRender } from "../neo-editor/features/promptline/refreshAndRender.js";
import { installPromptQueueEditor } from "./installPromptQueueEditor.js";
import { loadPromptQueueController } from "./loadPromptQueueController.js";
import { createPromptQueueController } from "./createPromptQueueController.js";
import type { PromptQueueController } from "./PromptQueueController.js";
import { schedulePromptQueueDispatch } from "./schedulePromptQueueDispatch.js";
import { prunePromptQueueFiles } from "./prunePromptQueueFiles.js";
import { getPromptQueueDir } from "./getPromptQueueDir.js";

/**
 * Registers the in-house Nexus prompt queue extension.
 *
 * @param pi Pi extension API.
 */
export function registerPromptQueueExtension(pi: ExtensionAPI): void {
  logExtensionEvent("prompt-queue", "init");
  let agentIdle = true;
  const deps: {
    exec: ExtensionAPI["exec"];
    getThinkingLevel: ExtensionAPI["getThinkingLevel"];
    setThinkingLevel: ExtensionAPI["setThinkingLevel"];
    getSessionName: ExtensionAPI["getSessionName"];
    getCommands: ExtensionAPI["getCommands"];
    getPromptlineConfig: typeof getPromptlineConfig;
    refreshPromptlineConfig: typeof refreshPromptlineConfig;
    promptQueue?: PromptQueueController;
    isAgentIdle: () => boolean;
  } = {
    exec: pi.exec,
    getThinkingLevel: pi.getThinkingLevel.bind(pi),
    setThinkingLevel: pi.setThinkingLevel.bind(pi),
    getSessionName: pi.getSessionName.bind(pi),
    getCommands: pi.getCommands.bind(pi),
    getPromptlineConfig,
    refreshPromptlineConfig,
    isAgentIdle: () => agentIdle,
  };

  pi.on("session_start", async (_event, ctx) => {
    if (!ctx.hasUI) return;
    void prunePromptQueueFiles(getPromptQueueDir(), ctx.sessionManager.getSessionDir());
    deps.promptQueue = createPromptQueueController(ctx.sessionManager.getSessionId());
    await loadPromptQueueController(deps.promptQueue, ctx.sessionManager.getSessionId());
    await refreshPromptlineConfig(ctx.cwd);
    await installPromptQueueEditor(ctx, deps as never);
    await refreshAndRender(ctx, deps as never);
  });

  pi.on("agent_start", async () => {
    agentIdle = false;
  });

  pi.on("agent_end", async () => {
    agentIdle = true;
  });

  pi.on("turn_end", async (_event, ctx) => {
    agentIdle = true;
    if (deps.promptQueue && schedulePromptQueueDispatch(deps.promptQueue, (text) => pi.sendUserMessage(text), () => void refreshAndRender(ctx, deps as never), setTimeout, () => ctx.isIdle())) return;
    await refreshAndRender(ctx, deps as never);
  });
}
