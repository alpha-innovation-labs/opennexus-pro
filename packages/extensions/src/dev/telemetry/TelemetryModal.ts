import { Key, matchesKey } from "@mariozechner/pi-tui";
import { getTrackedTelemetryEvents } from "@nexus/observability/telemetry/getTrackedTelemetryEvents.js";
import { toggleTelemetryEvent } from "@nexus/observability/telemetry/toggleTelemetryEvent.js";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";
import { createTelemetryModalItems } from "./createTelemetryModalItems.js";
import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

/**
 * Dev-only single-pane telemetry registry modal with per-event toggles.
 */
export class TelemetryModal extends SelectPreviewModal {
  private readonly events = getTrackedTelemetryEvents();

  /**
   * Creates the telemetry modal.
   *
   * @param theme Active UI theme.
   * @param done Completion callback.
   */
  constructor(theme: ExtensionCommandContext["ui"]["theme"], done: (result: undefined) => void) {
    super(theme, () => undefined, () => done(undefined), undefined, {
      leftTitle: "Telemetry",
      showRightPane: false,
    });
    this.setHeaderFocusMarkers(false);
    this.setBottom("Toggle", "Enter/space toggles selected event", "");
    this.refreshItems();
  }

  /**
   * Handles event toggle shortcuts.
   *
   * @param data Raw keyboard input.
   */
  override handleInput(data: string): void {
    if (data === " " || matchesKey(data, Key.enter)) {
      this.toggleSelectedEvent();
      return;
    }
    super.handleInput(data);
  }

  /**
   * Toggles the selected telemetry event.
   */
  private toggleSelectedEvent(): void {
    const selected = this.getSelectedItem();
    if (!selected) return;
    toggleTelemetryEvent(selected.value);
    this.refreshItems(selected.value);
  }

  /**
   * Refreshes modal rows and preserves selection.
   *
   * @param selectedValue Selected event id to restore.
   */
  private refreshItems(selectedValue = this.getSelectedItem()?.value): void {
    this.setItems(createTelemetryModalItems(this.events));
    if (selectedValue) this.selectValue(selectedValue);
  }
}
