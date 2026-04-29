import type { TelemetryAttributes } from "../telemetry/types.js";

/**
 * Creates a synthetic URL used by PostHog Web Analytics for TUI command views.
 *
 * @param properties Sanitized event properties.
 * @returns Synthetic Nexus URL.
 */
export function createPostHogPageViewUrl(properties: TelemetryAttributes): string {
  const commandName = typeof properties["command.name"] === "string" ? properties["command.name"] : "unknown";
  return `nexus://commands/${encodeURIComponent(commandName)}`;
}
