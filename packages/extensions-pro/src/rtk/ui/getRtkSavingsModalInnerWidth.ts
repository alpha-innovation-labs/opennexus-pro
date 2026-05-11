import { computeModalWidth } from "@nexus/tui-kit/modal/index.js";
import {
  RTK_SAVINGS_MODAL_MAX_WIDTH,
  RTK_SAVINGS_MODAL_MAX_WIDTH_RATIO,
  RTK_SAVINGS_MODAL_MIN_WIDTH,
} from "./rtkSavingsModalLayout.js";

/**
 * Computes the RTK savings modal inner width for header alignment.
 *
 * @param terminalWidth Current terminal width.
 * @returns Inner modal width.
 */
export function getRtkSavingsModalInnerWidth(terminalWidth: number): number {
  const computedWidth = computeModalWidth(terminalWidth, RTK_SAVINGS_MODAL_MIN_WIDTH, RTK_SAVINGS_MODAL_MAX_WIDTH_RATIO);
  const modalWidth = Math.min(computedWidth, RTK_SAVINGS_MODAL_MAX_WIDTH, terminalWidth);
  return Math.max(1, modalWidth - 2);
}
