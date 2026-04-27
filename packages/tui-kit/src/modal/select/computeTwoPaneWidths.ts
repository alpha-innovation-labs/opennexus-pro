/**
 * Computes split widths for select-preview modal panes.
 *
 * @param innerWidth Total inner width.
 * @param splitPane Whether both panes are visible.
 * @param leftPaneRatio Left pane ratio.
 * @param leftPaneMaxWidth Optional left pane cap.
 * @returns Left, right, and single-pane widths.
 */
export function computeTwoPaneWidths(innerWidth: number, splitPane: boolean, leftPaneRatio: number, leftPaneMaxWidth?: number): { leftWidth: number; rightWidth: number; singlePaneWidth: number } {
  const singlePaneWidth = innerWidth;
  const computedLeftWidth = splitPane ? Math.max(1, Math.floor((innerWidth - 1) * leftPaneRatio)) : singlePaneWidth;
  const leftWidth = splitPane ? Math.max(1, Math.min(computedLeftWidth, leftPaneMaxWidth ?? computedLeftWidth)) : singlePaneWidth;
  const rightWidth = splitPane ? innerWidth - 1 - leftWidth : singlePaneWidth;
  return { leftWidth, rightWidth, singlePaneWidth };
}
