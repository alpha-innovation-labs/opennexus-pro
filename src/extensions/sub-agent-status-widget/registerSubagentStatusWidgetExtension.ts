import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { applyWorkingLoaderSilencePatch } from "../../pi-internals/applyWorkingLoaderSilencePatch.js";
import { sharedSubagentRuntime } from "../sub-agents/runtime/sharedSubagentRuntime.js";
import { clearSubagentStatusWidget } from "./runtime/clearSubagentStatusWidget.js";
import { setPromptStartedAt } from "./runtime/promptWorkingState.js";
import { renderSubagentStatusWidget } from "./runtime/renderSubagentStatusWidget.js";

/**
 * Registers the subagent status widget extension.
 *
 * @param pi Pi extension API.
 */
export function registerSubagentStatusWidgetExtension(pi: ExtensionAPI): void {
  applyWorkingLoaderSilencePatch();
  let activeContext: ExtensionContext | null = null;
  const renderActive = (): void => {
    if (!activeContext?.hasUI) return;
    renderSubagentStatusWidget(activeContext);
  };

  sharedSubagentRuntime.subscribe(() => {
    renderActive();
  });

  const interval = setInterval(() => {
    renderActive();
  }, 100);

  pi.on("session_start", async (_event, ctx) => {
    activeContext = ctx;
    setPromptStartedAt(undefined);
    if (!ctx.hasUI) return;
    renderSubagentStatusWidget(ctx);
  });

  pi.on("message_start", async (_event, ctx) => {
    activeContext = ctx;
    setPromptStartedAt(Date.now());
    renderActive();
  });

  pi.on("message_end", async () => {
    setPromptStartedAt(undefined);
    renderActive();
  });

  pi.on("turn_end", async () => {
    renderActive();
  });

  pi.on("session_shutdown", async (_event, ctx) => {
    clearInterval(interval);
    setPromptStartedAt(undefined);
    if (!ctx.hasUI) return;
    clearSubagentStatusWidget(ctx);
    activeContext = null;
  });
}

export default registerSubagentStatusWidgetExtension;
