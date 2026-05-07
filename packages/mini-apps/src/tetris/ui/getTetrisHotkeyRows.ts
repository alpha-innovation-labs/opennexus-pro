export const TETRIS_HOTKEY_ROWS = [
	["Esc/C", "Hide"],
	["a/d", "Move"],
	["w", "Rotate"],
	["s", "Soft drop"],
	["←/→", "Move"],
	["↑", "Rotate"],
	["↓", "Soft drop"],
	["Space", "Hard drop"],
	["p", "Pause"],
	["r", "Restart"],
	["m", "Music"],
	["f", "Fullscreen"],
] as const;

/**
 * Returns all Tetris hotkey table rows.
 *
 * @returns Hotkey rows as key/action pairs.
 */
export function getTetrisHotkeyRows(): typeof TETRIS_HOTKEY_ROWS {
	return TETRIS_HOTKEY_ROWS;
}
