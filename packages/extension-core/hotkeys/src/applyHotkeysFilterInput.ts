import { Key, matchesKey } from "@earendil-works/pi-tui";
import { getHotkeysFilterToken } from "./getHotkeysFilterToken";

export type HotkeysFilterInputResult = {
	action?: "edit";
	filterActive?: boolean;
	filterQuery: string;
	scrollOffset: number;
	statusMessage: string;
};

/**
 * Applies one keypress to hotkeys filter mode.
 *
 * @param data Raw terminal input.
 * @param filterQuery Current filter query.
 * @returns Updated filter state or edit action.
 */
export function applyHotkeysFilterInput(
	data: string,
	filterQuery: string,
): HotkeysFilterInputResult {
	if (matchesKey(data, Key.enter))
		return { action: "edit", filterQuery, scrollOffset: 0, statusMessage: "" };
	if (matchesKey(data, Key.escape))
		return {
			filterActive: false,
			filterQuery,
			scrollOffset: 0,
			statusMessage: "",
		};
	if (data === "\u007f" || matchesKey(data, Key.backspace))
		return {
			filterQuery: filterQuery.slice(0, -1),
			scrollOffset: 0,
			statusMessage: "",
		};
	const filterToken = getHotkeysFilterToken(data);
	if (!filterToken) return { filterQuery, scrollOffset: 0, statusMessage: "" };
	return {
		filterQuery:
			data.length === 1 && data >= " "
				? filterQuery + filterToken
				: filterToken,
		scrollOffset: 0,
		statusMessage: "",
	};
}
