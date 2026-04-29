import type { TelemetryEventDefinition } from "./TelemetryEventDefinition.js";

/**
 * Privacy-reviewed telemetry events emitted by Nexus.
 */
export const trackedTelemetryEvents: readonly TelemetryEventDefinition[] = [
  {
    id: "app.start",
    label: "App start",
    description: "Nexus process started with anonymous runtime metadata.",
  },
  {
    id: "app.exit",
    label: "App exit",
    description: "Nexus process exited with the final process exit code.",
  },
  {
    id: "command.used",
    label: "Command used",
    description: "A Nexus slash or CLI command was used, without command arguments or user content.",
  },
  {
    id: "extension.used",
    label: "Extension used",
    description: "A bundled extension feature was used, identified only by extension and feature id.",
  },
  {
    id: "provider.category.selected",
    label: "Provider category selected",
    description: "A model provider category was selected, without model prompts, outputs, or credentials.",
  },
  {
    id: "startup.duration",
    label: "Startup duration",
    description: "Startup phase timing summary for Nexus runtime initialization.",
  },
  {
    id: "session.started",
    label: "Session started",
    description: "A Nexus session was started with mode metadata such as new or resumed.",
  },
  {
    id: "model.category.switched",
    label: "Model category switched",
    description: "A model category was selected, without prompt, response, or provider credential data.",
  },
  {
    id: "tool.error",
    label: "Tool error",
    description: "A tool failed with a sanitized category, not tool inputs, file paths, or outputs.",
  },
  {
    id: "app.crash",
    label: "App crash",
    description: "Nexus encountered an uncaught error with sanitized error category metadata.",
  },
  {
    id: "update.install.result",
    label: "Update install result",
    description: "A Nexus update or install flow completed with status metadata.",
  },
] as const;
