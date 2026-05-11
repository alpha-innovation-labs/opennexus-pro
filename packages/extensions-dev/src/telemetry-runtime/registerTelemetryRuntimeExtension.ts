import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { sendTelemetryEventSafely } from "@nexus/observability/telemetry/sendTelemetryEventSafely.js";
import { getInputCommandName } from "./getInputCommandName.js";
import { getModelCategory } from "./getModelCategory.js";
import { getProviderCategory } from "./getProviderCategory.js";
import { getSessionMode } from "./getSessionMode.js";
import { getToolErrorCategory } from "./getToolErrorCategory.js";
import { getToolName } from "./getToolName.js";

/**
 * Registers telemetry listeners for Pi runtime events used by Nexus.
 *
 * @param pi Pi extension API.
 */
export function registerTelemetryRuntimeExtension(pi: ExtensionAPI): void {
  pi.on("input" as never, async (event: unknown) => {
    const text = event && typeof event === "object" && typeof (event as { text?: unknown }).text === "string"
      ? (event as { text: string }).text
      : "";
    const commandName = getInputCommandName(text);
    if (!commandName) return;
    await sendTelemetryEventSafely("command.used", {
      "command.name": commandName,
      "command.source": commandName === "skills" || commandName.startsWith("skill:") ? "skill" : "input",
    });
  });

  pi.on("session_start" as never, async (event: unknown) => {
    await sendTelemetryEventSafely("session.started", {
      "session.mode": getSessionMode(event),
    });
  });

  pi.on("model_select" as never, async (event: unknown) => {
    const model = event && typeof event === "object" ? (event as { model?: unknown }).model : undefined;
    await sendTelemetryEventSafely("provider.category.selected", {
      "provider.category": getProviderCategory(model),
    });
    await sendTelemetryEventSafely("model.category.switched", {
      "model.category": getModelCategory(model),
      "model.source": event && typeof event === "object" && typeof (event as { source?: unknown }).source === "string"
        ? String((event as { source?: unknown }).source).slice(0, 40)
        : "unknown",
    });
  });

  pi.on("tool_result" as never, async (event: unknown) => {
    const isError = event && typeof event === "object" && (event as { isError?: unknown }).isError === true;
    if (!isError) return;
    await sendTelemetryEventSafely("tool.error", {
      "tool.name": getToolName(event),
      "tool.error_category": getToolErrorCategory(event),
    });
  });
}
