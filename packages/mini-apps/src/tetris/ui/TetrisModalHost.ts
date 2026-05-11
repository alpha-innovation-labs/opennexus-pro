import type { TUI } from "@earendil-works/pi-tui";

/** Minimal TUI surface required by the Tetris modal. */
export type TetrisModalHost = Pick<TUI, "requestRender"> & { terminal?: Pick<TUI["terminal"], "rows"> };
