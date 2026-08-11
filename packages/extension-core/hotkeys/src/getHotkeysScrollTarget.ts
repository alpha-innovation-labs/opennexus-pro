/**
 * Resolves Vim-style hotkeys scroll target commands.
 *
 * @param data Raw terminal input.
 * @param pendingGo Whether a previous `g` is waiting for `gg`.
 * @returns Scroll target and updated pending state.
 */
export function getHotkeysScrollTarget(
	data: string,
	pendingGo: boolean,
): { target?: "top" | "bottom"; pendingGo: boolean } {
	if (data === "G") return { target: "bottom", pendingGo: false };
	if (data !== "g") return { pendingGo: false };
	if (pendingGo) return { target: "top", pendingGo: false };
	return { pendingGo: true };
}
