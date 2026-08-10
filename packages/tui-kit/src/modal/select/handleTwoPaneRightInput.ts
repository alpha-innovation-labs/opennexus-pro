import { Key, matchesKey } from "@earendil-works/pi-tui";
import { getTwoPaneBodyHeight } from "./getTwoPaneBodyHeight";

export type TwoPaneRightInputState = {
  data: string;
  pendingRightGotoStart: boolean;
  rightLinesLength: number;
  rightScrollOffset: number;
};

export type TwoPaneRightInputResult = {
  activePane: "left" | "right";
  close: boolean;
  pendingRightGotoStart: boolean;
  rightScrollOffset: number;
};

/**
 * Applies keyboard input for a focused right preview pane.
 *
 * @param state Current right-pane input state.
 * @returns Updated right-pane state.
 */
export function handleTwoPaneRightInput(state: TwoPaneRightInputState): TwoPaneRightInputResult {
  if (matchesKey(state.data, Key.ctrl("c"))) return { ...state, activePane: "right", close: true };
  if (matchesKey(state.data, Key.escape) || matchesKey(state.data, Key.tab)) return { ...state, activePane: "left", close: false, pendingRightGotoStart: false };
  if (state.data === "G") return { ...state, activePane: "right", close: false, pendingRightGotoStart: false, rightScrollOffset: maxOffset(state.rightLinesLength) };
  if (state.data === "g") return handleGotoStart(state);
  if (state.data === "j" || matchesKey(state.data, Key.down) || matchesKey(state.data, Key.ctrl("n"))) return scrollBy(state, 1);
  if (state.data === "k" || matchesKey(state.data, Key.up) || matchesKey(state.data, Key.ctrl("p"))) return scrollBy(state, -1);
  if (matchesKey(state.data, Key.ctrl("d"))) return scrollBy(state, Math.max(1, Math.floor(getTwoPaneBodyHeight() / 2)));
  if (matchesKey(state.data, Key.ctrl("u"))) return scrollBy(state, -Math.max(1, Math.floor(getTwoPaneBodyHeight() / 2)));
  return { ...state, activePane: "right", close: false, pendingRightGotoStart: false };
}

/**
 * Handles the two-key `gg` jump to preview start.
 *
 * @param state Current right-pane input state.
 * @returns Updated right-pane state.
 */
function handleGotoStart(state: TwoPaneRightInputState): TwoPaneRightInputResult {
  if (state.pendingRightGotoStart) return { ...state, activePane: "right", close: false, pendingRightGotoStart: false, rightScrollOffset: 0 };
  return { ...state, activePane: "right", close: false, pendingRightGotoStart: true };
}

/**
 * Scrolls the right pane by a delta.
 *
 * @param state Current right-pane input state.
 * @param delta Scroll delta.
 * @returns Updated right-pane state.
 */
function scrollBy(state: TwoPaneRightInputState, delta: number): TwoPaneRightInputResult {
  const rightScrollOffset = Math.max(0, Math.min(maxOffset(state.rightLinesLength), state.rightScrollOffset + delta));
  return { ...state, activePane: "right", close: false, pendingRightGotoStart: false, rightScrollOffset };
}

/**
 * Calculates the max scroll offset for right-pane content.
 *
 * @param rightLinesLength Number of right-pane lines.
 * @returns Maximum scroll offset.
 */
function maxOffset(rightLinesLength: number): number {
  return Math.max(0, rightLinesLength - Math.max(1, getTwoPaneBodyHeight()));
}
