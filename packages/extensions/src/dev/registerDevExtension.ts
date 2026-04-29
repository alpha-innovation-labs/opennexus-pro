import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerDevModalCommand } from "./command/registerDevModalCommand.js";
import { registerTelemetryCommand } from "./telemetry/registerTelemetryCommand.js";

/**
 * Registers dev-only commands used for manual extension and UI testing.
 *
 * @param pi Pi extension API.
 */
export function registerDevExtension(pi: ExtensionAPI): void {
  registerDevModalCommand(pi);
  registerTelemetryCommand(pi);
}
