import { Key, matchesKey } from "@mariozechner/pi-tui";

/**
 * Checks one raw key payload against a named Tetris control key.
 *
 * @param data Raw keyboard payload.
 * @param key Named Pi TUI key.
 * @param sequences Fallback escape sequences emitted by terminals.
 * @returns True when the payload matches the key.
 */
export function isTetrisKey(data: string, key: string, sequences: string[]): boolean {
	return matchesKey(data, key as never) || sequences.includes(data);
}

/** Matches Escape close input. */
export function isTetrisEscape(data: string): boolean { return isTetrisKey(data, Key.escape, ["\x1b"]); }

/** Matches Ctrl+C close input. */
export function isTetrisQuit(data: string): boolean { return isTetrisKey(data, Key.ctrl("c"), ["\x03"]); }

/** Matches left movement input. */
export function isTetrisLeft(data: string): boolean { return isTetrisKey(data, Key.left, ["\x1b[D", "\x1bOD"]); }

/** Matches right movement input. */
export function isTetrisRight(data: string): boolean { return isTetrisKey(data, Key.right, ["\x1b[C", "\x1bOC"]); }

/** Matches rotation input. */
export function isTetrisUp(data: string): boolean { return isTetrisKey(data, Key.up, ["\x1b[A", "\x1bOA"]); }

/** Matches soft-drop input. */
export function isTetrisDown(data: string): boolean { return isTetrisKey(data, Key.down, ["\x1b[B", "\x1bOB"]); }
