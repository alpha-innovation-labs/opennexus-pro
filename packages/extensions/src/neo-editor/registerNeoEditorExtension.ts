import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { readProjectSettings } from "./features/menu/readProjectSettings.js";
import { setToolGroupCollapseEnabled } from "../tron/collapse/state.js";
import { ensurePromptlineInstalled } from "./features/promptline/ensurePromptlineInstalled.js";
import { getPromptlineConfig } from "./features/promptline/config/getPromptlineConfig.js";
import { refreshPromptlineConfig } from "./features/promptline/config/refreshPromptlineConfig.js";
import { installPromptlineFooter } from "./features/promptline/installPromptlineFooter.js";
import { refreshAndRender } from "./features/promptline/refreshAndRender.js";
import { resetPromptlineState } from "./features/promptline/resetPromptlineState.js";
import { setPromptlineModelOverride } from "./features/promptline/state.js";
import { primeStartupLoginModal } from "./primeStartupLoginModal.js";
import { primeStartupResumeModal } from "./primeStartupResumeModal.js";

export default function(pi: ExtensionAPI) {
  logExtensionEvent("neo-editor", "init");

  const deps = {
    exec: pi.exec,
    getThinkingLevel: pi.getThinkingLevel.bind(pi),
    setThinkingLevel: pi.setThinkingLevel.bind(pi),
    getSessionName: pi.getSessionName.bind(pi),
    getPromptlineConfig,
    refreshPromptlineConfig,
  };

  pi.on("session_start", async (event, ctx) => {
    logExtensionEvent("neo-editor", "session_start", {
      reason: event.reason,
      sessionFile: ctx.sessionManager.getSessionFile() ?? null,
    });
    await refreshPromptlineConfig(ctx.cwd);
    ensurePromptlineInstalled(ctx, deps);
    logExtensionEvent("neo-editor", "session_start:afterEnsure", {
      sessionFile: ctx.sessionManager.getSessionFile() ?? null,
    });
    const projectSettings = await readProjectSettings(ctx.cwd);
    setToolGroupCollapseEnabled(projectSettings.autoCompact === true);
    await refreshAndRender(ctx, deps);
    await primeStartupResumeModal(event.reason, ctx);
    await primeStartupLoginModal(event.reason, ctx);
    logExtensionEvent("neo-editor", "session_start:done", {
      sessionFile: ctx.sessionManager.getSessionFile() ?? null,
    });
  });

  pi.on("turn_end", async (_event, ctx) => {
    await refreshAndRender(ctx, deps);
  });

  pi.on("model_select", async (event, ctx) => {
    setPromptlineModelOverride(event.model);
    installPromptlineFooter(ctx, deps, event.model);
    await refreshAndRender(ctx, deps);
  });

  pi.on("session_tree", async (_event, ctx) => {
    await refreshAndRender(ctx, deps);
  });

  pi.on("session_compact", async (_event, ctx) => {
    await refreshAndRender(ctx, deps);
  });

  pi.on("session_shutdown", async () => {
    resetPromptlineState();
  });
}
