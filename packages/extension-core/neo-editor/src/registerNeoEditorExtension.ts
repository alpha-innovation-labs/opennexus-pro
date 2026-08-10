import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug";
import { createContextUsageReport } from "@extensions/context-usage/createContextUsageReport";
import type { ContextUsageReport } from "@extensions/context-usage/types";
import { createRuntimeSnapshot } from "@extensions/context-usage/createRuntimeSnapshot";
import { readProjectConfig } from "@extensions/slash-menu/readProjectConfig";
import { setToolGroupCollapseEnabled } from "@extensions/tron/collapse/state";
import { ensurePromptlineInstalled } from "./features/promptline/ensurePromptlineInstalled";
import { getPromptlineConfig } from "./features/promptline/config/getPromptlineConfig";
import { refreshPromptlineConfig } from "./features/promptline/config/refreshPromptlineConfig";
import { refreshAndRender } from "./features/promptline/refreshAndRender";
import { resetPromptlineState } from "./features/promptline/resetPromptlineState";
import { getPromptlineRenderRequest, setPromptlineModelOverride } from "./features/promptline/state";
import { setRefreshRequestCallback } from "./features/promptline/state";
import { registerPromptlineStatusWidget } from "./features/promptline/status-widget/registerPromptlineStatusWidget";
import { primeStartupResumeModal } from "./primeStartupResumeModal";

let startupContextReport: ContextUsageReport | undefined;

export default function(pi: ExtensionAPI) {
  logExtensionEvent("neo-editor", "init");
  registerPromptlineStatusWidget(pi);
  const deps = {
    exec: pi.exec,
    getThinkingLevel: pi.getThinkingLevel.bind(pi),
    setThinkingLevel: pi.setThinkingLevel.bind(pi),
    getSessionName: pi.getSessionName.bind(pi),
    getCommands: pi.getCommands.bind(pi),
    getAllTools: pi.getAllTools.bind(pi),
    getPromptlineConfig,
    refreshPromptlineConfig,
  };

  pi.on("session_start", async (event, ctx) => {
    logExtensionEvent("neo-editor", "session_start", {
      reason: event.reason,
      sessionFile: ctx.sessionManager.getSessionFile() ?? null,
    });
    await logContextUsageOnStartup(ctx);
    await refreshPromptlineConfig(ctx.cwd);
    ensurePromptlineInstalled(ctx, deps);
    logExtensionEvent("neo-editor", "session_start:afterEnsure", {
      sessionFile: ctx.sessionManager.getSessionFile() ?? null,
    });
    const projectConfig = await readProjectConfig(ctx.cwd);
    setToolGroupCollapseEnabled(projectConfig.autoCompact === true);
    await refreshAndRender(ctx, deps);
    await primeStartupResumeModal(event.reason, ctx);
    logExtensionEvent("neo-editor", "session_start:done", {
      sessionFile: ctx.sessionManager.getSessionFile() ?? null,
    });
  });

  pi.on("turn_end", async (_event, ctx) => {
    await refreshAndRender(ctx, deps);
  });

  pi.on("model_select", async (event, ctx) => {
    setPromptlineModelOverride(event.model);
    getPromptlineRenderRequest()?.(true);
    await refreshAndRender(ctx, deps);
  });

  // Wire promptline refresh callback to real-time TPS badge updates.
  // The TPS interval fires every 500ms during streaming and calls the
  // promptline render request, which updates the entire promptline including
  // the TPS badge shown alongside the thinking badge in the footer.
  setRefreshRequestCallback(() => getPromptlineRenderRequest()?.());

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

/**
 * Calls `createContextUsageReport` once on session start and logs the result.
 *
 * @param ctx Extension context.
 */
async function logContextUsageOnStartup(ctx: ExtensionContext): Promise<void> {
  try {
    const report = await createContextUsageReport(createRuntimeSnapshot(ctx));
    startupContextReport = report;
  } catch (error: unknown) {
    console.error("[neo-editor] createContextUsageReport failed:", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Returns the startup context usage report, if available.
 *
 * @returns Startup report or undefined.
 */
export function getStartupContextReport(): ContextUsageReport | undefined {
  return startupContextReport;
}
