import { SharedModal } from "@nexus/tui-kit/modal/index.js";
import type { UsageHistoryRecord } from "../history/types.js";
import { createUsageHistoryLines } from "./createUsageHistoryLines.js";

/**
 * Modal that renders historical usage graph series.
 */
export class UsageHistoryModal extends SharedModal {
  /**
   * Creates a usage history modal.
   *
   * @param theme UI theme.
   * @param records Usage history records.
   * @param onClose Close callback.
   */
  constructor(theme: ConstructorParameters<typeof SharedModal>[0]["theme"], records: UsageHistoryRecord[], onClose: () => void) {
    super({
      theme,
      minWidth: 72,
      maxWidthRatio: 0.85,
      headerLines: [theme.fg("accent", "Usage history")],
      panes: [{ id: "history", size: 1, lines: createUsageHistoryLines(records, 68) }],
      footerLines: [theme.fg("muted", "5-minute snapshots · Esc closes")],
      onClose,
    });
  }
}
