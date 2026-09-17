import type { Component, TuiMouseEvent } from "@earendil-works/pi-tui";
import { dispatchMouseEvent } from "@earendil-works/pi-tui/dist/tui.js";

export type { Component, TuiMouseEvent } from "@earendil-works/pi-tui";

/** Forwards only visible rows, retaining Pi's mouse-target coordinate metadata. */
export function forwardMouseToChild(
	child: Component | undefined,
	event: TuiMouseEvent,
	row: number,
	rows: number,
) {
	const height = Math.max(0, Math.min(rows, event.height - row));
	if (!child || event.x < 0 || event.x >= event.width
		|| event.y < row || event.y >= row + height) return undefined;
	return dispatchMouseEvent(child, { ...event, y: event.y - row, height });
}
