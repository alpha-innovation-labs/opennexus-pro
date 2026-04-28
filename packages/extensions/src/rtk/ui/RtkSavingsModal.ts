import { Key, matchesKey } from "@mariozechner/pi-tui";
import { SharedModal, type SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import type { RtkGainReport } from "../savings/RtkGainReport.js";
import type { RtkSavingsPeriodKey } from "../savings/RtkSavingsPeriodKey.js";
import { createRtkSavingsHeaderLine } from "../savings/createRtkSavingsHeaderLine.js";
import { createRtkSavingsLines } from "../savings/createRtkSavingsLines.js";
import { getNextRtkSavingsPeriod } from "../savings/getNextRtkSavingsPeriod.js";
import { getRtkSavingsModalInnerWidth } from "./getRtkSavingsModalInnerWidth.js";
import {
  RTK_SAVINGS_MODAL_MAX_WIDTH,
  RTK_SAVINGS_MODAL_MAX_WIDTH_RATIO,
  RTK_SAVINGS_MODAL_MIN_WIDTH,
} from "./rtkSavingsModalLayout.js";

/**
 * Modal that displays RTK token savings.
 */
export class RtkSavingsModal extends SharedModal {
  private readonly onRenderNeeded: () => void;
  private readonly report: RtkGainReport;
  private selectedPeriod: RtkSavingsPeriodKey = "daily";

  /**
   * Creates the RTK savings modal.
   *
   * @param theme Active UI theme.
   * @param report Parsed RTK gain report.
   * @param onClose Close callback.
   * @param onRenderNeeded Render request callback.
   */
  constructor(theme: SharedModalTheme, report: RtkGainReport, onClose: () => void, onRenderNeeded = () => undefined) {
    super({
      headerLines: [theme.fg("accent", "Token Savings")],
      maxWidth: RTK_SAVINGS_MODAL_MAX_WIDTH,
      maxWidthRatio: RTK_SAVINGS_MODAL_MAX_WIDTH_RATIO,
      minWidth: RTK_SAVINGS_MODAL_MIN_WIDTH,
      onClose,
      panes: [{ id: "savings", lines: createRtkSavingsLines(report, theme, "daily"), size: 1 }],
      theme,
    });
    this.onRenderNeeded = onRenderNeeded;
    this.report = report;
  }

  /**
   * Handles period selector tab navigation.
   *
   * @param data Raw keyboard input.
   */
  override handleInput(data: string): void {
    if (matchesKey(data, Key.tab)) {
      this.selectPeriod(1);
      return;
    }

    if (matchesKey(data, Key.shift("tab"))) {
      this.selectPeriod(-1);
      return;
    }

    super.handleInput(data);
  }

  /**
   * Renders the modal after aligning the header selector to the right edge.
   *
   * @param width Available terminal width.
   * @returns Rendered modal lines.
   */
  override render(width: number): string[] {
    this.headerLines = [createRtkSavingsHeaderLine(this.theme, this.selectedPeriod, getRtkSavingsModalInnerWidth(width))];
    return super.render(width);
  }

  /**
   * Selects the next or previous period.
   *
   * @param direction Selection direction.
   */
  private selectPeriod(direction: 1 | -1): void {
    this.selectedPeriod = getNextRtkSavingsPeriod(this.selectedPeriod, direction);
    this.panes = [{ id: "savings", lines: createRtkSavingsLines(this.report, this.theme, this.selectedPeriod), size: 1 }];
    this.onRenderNeeded();
  }
}
