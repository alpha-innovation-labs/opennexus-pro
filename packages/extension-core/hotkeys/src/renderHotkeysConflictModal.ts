import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index";
import { padVisible } from "./padVisible";
import type { PendingHotkeysConflict } from "./types";

/**
 * Renders the conflict approval prompt above the hotkeys list.
 *
 * @param uiTheme Active UI theme.
 * @param conflict Pending conflict details.
 * @param width Available content width.
 * @returns Conflict modal lines.
 */
export function renderHotkeysConflictModal(
	uiTheme: SelectPreviewTheme,
	conflict: PendingHotkeysConflict,
	width: number,
): string[] {
	const innerWidth = Math.max(1, width - 2);
	const conflictText = `${conflict.conflictingIds.join(", ")} already uses ${conflict.key}`;
	const targetText = `Override and bind ${conflict.keybindingId}?`;
	const actionText = "Enter approve · Esc cancel";
	return [
		uiTheme.fg("warning", `┌${"─".repeat(innerWidth)}┐`),
		uiTheme.fg("warning", "│") +
			padVisible(uiTheme.bold("Hotkey conflict"), innerWidth) +
			uiTheme.fg("warning", "│"),
		uiTheme.fg("warning", "│") +
			padVisible(conflictText.slice(0, innerWidth), innerWidth) +
			uiTheme.fg("warning", "│"),
		uiTheme.fg("warning", "│") +
			padVisible(targetText.slice(0, innerWidth), innerWidth) +
			uiTheme.fg("warning", "│"),
		uiTheme.fg("warning", "│") +
			padVisible(uiTheme.fg("dim", actionText), innerWidth) +
			uiTheme.fg("warning", "│"),
		uiTheme.fg("warning", `└${"─".repeat(innerWidth)}┘`),
		"",
	];
}
