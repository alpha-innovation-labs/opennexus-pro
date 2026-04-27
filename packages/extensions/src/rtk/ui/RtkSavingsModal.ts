import { SharedModal, type SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import type { RtkGainReport } from "../savings/RtkGainReport.js";
import { colorizeSavingsPercent } from "../savings/colorizeSavingsPercent.js";
import { colorizeSavingsValue } from "../savings/colorizeSavingsValue.js";
import { createRtkSavingsLines } from "../savings/createRtkSavingsLines.js";
import { formatPercent } from "../savings/formatPercent.js";
import { formatTokenCount } from "../savings/formatTokenCount.js";

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
    const summary = report.summary;
    super({
      footerLines: ["Esc close"],
      headerLines: [
        theme.fg("accent", "RTK Token Savings"),
        `Saved ${colorizeSavingsValue(theme, formatTokenCount(summary.total_saved))} tokens · ${colorizeSavingsPercent(theme, formatPercent(summary.avg_savings_pct))} average savings`,
      ],
      maxWidth: 72,
      maxWidthRatio: 0.8,
      minWidth: 56,
      onClose,
      panes: [{ id: "savings", lines: createRtkSavingsLines(report, theme), size: 1 }],
      theme,
    });
  }
}
