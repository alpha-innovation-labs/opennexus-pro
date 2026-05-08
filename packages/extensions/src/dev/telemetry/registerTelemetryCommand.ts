import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "../../slash-menu/withSlashMenuGroup.js";
import { showTelemetryModal } from "./showTelemetryModal.js";

/**
 * Registers the dev-only /telemetry command.
 *
 * @param pi Pi extension API.
 */
export function registerTelemetryCommand(pi: ExtensionAPI): void {
  pi.registerCommand("telemetry", withSlashMenuGroup({
    description: "Open dev-only telemetry event toggles.",
    handler: async (_args, ctx) => {
      await showTelemetryModal(ctx);
    },
  }, "Extensions"));
}
