import type { AutocompleteItem } from "@mariozechner/pi-tui";
import type { TelemetryEventDefinition } from "@nexus/observability/telemetry/TelemetryEventDefinition.js";
import { isTelemetryEventEnabled } from "@nexus/observability/telemetry/isTelemetryEventEnabled.js";

/**
 * Creates selectable rows for the dev-only telemetry modal.
 *
 * @param events Telemetry events to show.
 * @returns Autocomplete items with current enabled state in their labels.
 */
export function createTelemetryModalItems(events: TelemetryEventDefinition[]): AutocompleteItem[] {
  return events.map((event) => ({
    label: `${isTelemetryEventEnabled(event.id) ? "●" : "○"} ${event.label}`,
    value: event.id,
    description: event.description,
  }));
}
