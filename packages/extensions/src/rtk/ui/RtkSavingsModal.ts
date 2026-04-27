import { SharedModal, type SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import type { RtkGainReport } from "../savings/RtkGainReport.js";
import { createRtkSavingsLines } from "../savings/createRtkSavingsLines.js";

/**
 * Modal that displays RTK token savings.
 */
export class RtkSavingsModal extends SharedModal {
  /**
   * Creates the RTK savings modal.
   *
   * @param theme Active UI theme.
   * @param report Parsed RTK gain report.
   * @param onClose Close callback.
   */
  constructor(theme: SharedModalTheme, report: RtkGainReport, onClose: () => void) {
    super({
      headerLines: [theme.fg("accent", "Token Savings")],
      maxWidth: 72,
      maxWidthRatio: 0.8,
      minWidth: 56,
      onClose,
      panes: [{ id: "savings", lines: createRtkSavingsLines(report, theme), size: 1 }],
      theme,
    });
  }
}
