import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerObservationsCommand } from "./command/registerObservationsCommand";
import { registerObservationTracker } from "./tracker/registerObservationTracker";

/**
 * Registers the full observations extension surface.
 *
 * @param pi Pi extension API.
 */
export function registerObservationsExtension(pi: ExtensionAPI): void {
	registerObservationTracker(pi);
	registerObservationsCommand(pi);
}
