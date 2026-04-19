import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerObservationsCommand } from "./command/registerObservationsCommand.js";
import { registerObservationsStatusWidget } from "./status-widget/registerObservationsStatusWidget.js";
import { registerObservationTracker } from "./tracker/registerObservationTracker.js";

/**
 * Registers the full observations extension surface.
 *
 * @param pi Pi extension API.
 */
export function registerObservationsExtension(pi: ExtensionAPI): void {
	registerObservationTracker(pi);
	registerObservationsStatusWidget(pi);
	registerObservationsCommand(pi);
}
