import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { logExtensionEvent } from "../shared/observability/startup-debug.ts";
import { readProjectSettings } from "../shared/slash-menu/readProjectSettings.js";
import { setToolGroupCollapseEnabled } from "../tron/collapse/state.js";
import { ensurePromptlineInstalled } from "./promptline/ensurePromptlineInstalled.js";
import { refreshAndRender } from "./promptline/refreshAndRender.js";
import { resetPromptlineState } from "./promptline/resetPromptlineState.js";
import { primeStartupResumeModal } from "./primeStartupResumeModal.js";

export default function(pi: ExtensionAPI) {
  logExtensionEvent("neo-editor", "init");
  const deps = {
    exec: pi.exec,
    getThinkingLevel: pi.getThinkingLevel.bind(pi),
    setThinkingLevel: pi.setThinkingLevel.bind(pi),
    getSessionName: pi.getSessionName.bind(pi),
  };

  pi.on("session_start", async (event, ctx) => {
    logExtensionEvent("neo-editor", "session_start", {
      reason: event.reason,
      sessionFile: ctx.sessionManager.getSessionFile() ?? null,
    });
    ensurePromptlineInstalled(ctx, deps);
    logExtensionEvent("neo-editor", "session_start:afterEnsure", {
      sessionFile: ctx.sessionManager.getSessionFile() ?? null,
    });
    const projectSettings = await readProjectSettings(ctx.cwd);
    setToolGroupCollapseEnabled(projectSettings.autoCompact === true);
    await refreshAndRender(ctx, deps);
    await primeStartupResumeModal(event.reason, ctx);
    logExtensionEvent("neo-editor", "session_start:done", {
      sessionFile: ctx.sessionManager.getSessionFile() ?? null,
    });
  });

  pi.on("turn_end", async (_event, ctx) => {
    await refreshAndRender(ctx, deps);
  });

  pi.on("model_select", async (_event, ctx) => {
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
