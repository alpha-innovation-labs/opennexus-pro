import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerObservationsCommand } from "./command/registerObservationsCommand.js";
import { registerObservationTracker } from "./tracker/registerObservationTracker.js";

/**
 * Registers the full observations extension surface.
 *
 * @param pi Pi extension API.
 */
export function registerObservationsExtension(pi: ExtensionAPI): void {
	registerObservationTracker(pi);
	registerObservationsCommand(pi);
}
