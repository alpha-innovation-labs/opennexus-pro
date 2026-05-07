import { Key, matchesKey } from "@mariozechner/pi-tui";

export type ModalScrollInputState = {
  data: string;
  maxScrollOffset: number;
  pendingGotoStart: boolean;
  scrollOffset: number;
  visibleRows: number;
};

export type ModalScrollInputResult = {
  handled: boolean;
  pendingGotoStart: boolean;
  scrollOffset: number;
};

/**
 * Applies keyboard input to an overflowing modal scroll position.
 *
 * @param state Current scroll state and raw keyboard data.
 * @returns Updated scroll state.
 */
export function handleModalScrollInput(state: ModalScrollInputState): ModalScrollInputResult {
  if (state.data === "G") return scrollTo(state, state.maxScrollOffset);
  if (state.data === "g") return handleGotoStart(state);
  if (state.data === "j") return scrollBy(state, 1);
  if (state.data === "k") return scrollBy(state, -1);
  if (state.data === Key.ctrl("d") || matchesKey(state.data, Key.ctrl("d"))) return scrollBy(state, Math.max(1, Math.floor(state.visibleRows / 2)));
  if (state.data === Key.ctrl("u") || matchesKey(state.data, Key.ctrl("u"))) return scrollBy(state, -Math.max(1, Math.floor(state.visibleRows / 2)));
  return { handled: false, pendingGotoStart: false, scrollOffset: state.scrollOffset };
}

/**
 * Handles the two-key `gg` jump to modal content start.
 *
 * @param state Current scroll state.
 * @returns Updated scroll state.
 */
function handleGotoStart(state: ModalScrollInputState): ModalScrollInputResult {
  if (state.pendingGotoStart) return scrollTo(state, 0);
  return { handled: true, pendingGotoStart: true, scrollOffset: state.scrollOffset };
}

/**
 * Scrolls by a row delta.
 *
 * @param state Current scroll state.
 * @param delta Number of rows to move.
 * @returns Updated scroll state.
 */
function scrollBy(state: ModalScrollInputState, delta: number): ModalScrollInputResult {
  return scrollTo(state, state.scrollOffset + delta);
}

/**
 * Scrolls to a clamped row offset.
 *
 * @param state Current scroll state.
 * @param offset Requested row offset.
 * @returns Updated scroll state.
 */
function scrollTo(state: ModalScrollInputState, offset: number): ModalScrollInputResult {
  return {
    handled: true,
    pendingGotoStart: false,
    scrollOffset: Math.max(0, Math.min(state.maxScrollOffset, offset)),
  };
}
