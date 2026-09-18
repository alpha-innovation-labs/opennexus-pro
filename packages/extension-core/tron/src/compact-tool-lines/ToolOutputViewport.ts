import { truncateToWidth, visibleWidth, type Component, type TuiMouseEvent, type TuiMouseEventResult } from "@earendil-works/pi-tui";
import { dispatchMouseEvent } from "@earendil-works/pi-tui/dist/tui.js";
import type { EntryRenderer } from "../transcript/types";

export const MAX_TOOL_OUTPUT_ROWS = 30;
export type ToolOutputScrollState = { top: number };
const scrollStates = new WeakMap<object, ToolOutputScrollState>();

/** Pi keeps this state object for the lifetime of one tool execution. */
export function getToolOutputScrollState(owner?: object): ToolOutputScrollState {
	if (!owner) return { top: 0 };
	let state = scrollStates.get(owner);
	if (!state) { state = { top: 0 }; scrollStates.set(owner, state); }
	return state;
}

/** A bounded leaf viewport: native layout ScrollViews cannot see through tool render shells. */
export class ToolOutputViewport implements Component {
	private width = 0;
	private contentWidth = 0;
	private totalRows = 0;
	private rows = 0;
	private scrollbar = false;
	private dragOffset: number | undefined;

	constructor(
		private readonly child: EntryRenderer,
		private readonly state: ToolOutputScrollState,
		private readonly color: (text: string) => string,
	) {}

	render(width: number): string[] {
		this.width = width;
		if (width <= 0) { this.rows = this.totalRows = 0; return []; }
		let lines = this.child.render(width);
		this.scrollbar = lines.length > MAX_TOOL_OUTPUT_ROWS && width > 1;
		this.contentWidth = width - (this.scrollbar ? 1 : 0);
		if (this.scrollbar) lines = this.child.render(this.contentWidth);
		this.totalRows = lines.length;
		this.rows = Math.min(MAX_TOOL_OUTPUT_ROWS, lines.length);
		this.state.top = Math.max(0, Math.min(this.maxTop, this.state.top));
		const { start, size } = this.thumb;
		return lines.slice(this.state.top, this.state.top + this.rows).map((line, index) => {
			const body = truncateToWidth(line, this.contentWidth, "");
			if (!this.scrollbar) return body;
			return body + " ".repeat(Math.max(0, this.contentWidth - visibleWidth(body)))
				+ this.color(index >= start && index < start + size ? "█" : "│");
		});
	}

	private get maxTop(): number { return Math.max(0, this.totalRows - this.rows); }
	private get thumb(): { start: number; size: number } {
		const size = Math.max(1, Math.floor(this.rows * this.rows / Math.max(1, this.totalRows)));
		return { size, start: this.maxTop ? Math.round(this.state.top / this.maxTop * (this.rows - size)) : 0 };
	}
	private dragTo(y: number): void {
		const track = this.rows - this.thumb.size;
		this.state.top = track > 0
			? Math.round(Math.max(0, Math.min(track, y - (this.dragOffset ?? 0))) / track * this.maxTop) : 0;
	}

	handleMouse(event: TuiMouseEvent): TuiMouseEventResult | undefined {
		if (this.dragOffset !== undefined) {
			if (event.type === "drag") { this.dragTo(event.y); return { handled: true, render: true }; }
			if (event.type === "release") { this.dragOffset = undefined; return { handled: true, render: true }; }
		}
		if (event.width !== this.width || event.x < 0 || event.x >= this.width
			|| event.y < 0 || event.y >= Math.min(this.rows, event.height)) return undefined;
		if (event.type === "wheel") {
			const delta = event.wheelDelta ?? 0;
			if (!Number.isFinite(delta)) return undefined;
			const next = Math.max(0, Math.min(this.maxTop, this.state.top + Math.trunc(delta)));
			if (next === this.state.top) return undefined; // Chain to transcript at the boundary.
			this.state.top = next;
			return { handled: true, render: true };
		}
		if (this.scrollbar && event.x === this.width - 1) {
			if (event.type === "press" && event.button === "left") {
				const { start, size } = this.thumb;
				this.dragOffset = event.y >= start && event.y < start + size ? event.y - start : Math.floor(size / 2);
				this.dragTo(event.y);
				return { handled: true, capture: true, render: true };
			}
			if (event.type === "click" && event.button === "left") return { handled: true, render: false };
			return undefined;
		}
		// Child controls take priority. Otherwise let Pi's enclosing MouseRegion
		// collapse on a completed click, and leave text-selection drags untouched.
		return dispatchMouseEvent(this.child as Component, {
			...event, y: event.y + this.state.top, width: this.contentWidth, height: this.totalRows,
		});
	}

	invalidate(): void { this.child.invalidate?.(); }
}
