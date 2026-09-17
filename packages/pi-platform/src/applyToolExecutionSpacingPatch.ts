import { ToolExecutionComponent } from "@earendil-works/pi-coding-agent";
import { Spacer, type TuiMouseEvent, type TuiMouseEventResult } from "@earendil-works/pi-tui";

const LEADING_SPACER_SKIPPED = Symbol("toolExecutionLeadingSpacerSkipped");
const RENDERED_BOUNDS = Symbol("toolExecutionRenderedBounds");
let toolExecutionSpacingPatchApplied = false;

/**
 * Removes Pi's default leading spacer for every tool execution.
 */
export function applyToolExecutionSpacingPatch(): void {
	if (toolExecutionSpacingPatchApplied) {
		return;
	}

	const prototype = ToolExecutionComponent.prototype as unknown as {
		addChild(child: unknown): void;
		render(width: number): string[];
		handleMouse?(event: TuiMouseEvent): TuiMouseEventResult | undefined;
		getRenderContext(lastComponent?: unknown): Record<string, unknown>;
		ui?: { mode?: string };
		[LEADING_SPACER_SKIPPED]?: boolean;
		[RENDERED_BOUNDS]?: { width: number; height: number; removedRows: number };
	};
	const originalAddChild = prototype.addChild;
	const originalRender = prototype.render;
	const originalHandleMouse = prototype.handleMouse;
	const originalGetRenderContext = prototype.getRenderContext;
	prototype.getRenderContext = function getRenderContextWithViewport(lastComponent) {
		return { ...originalGetRenderContext.call(this, lastComponent), toolOutputViewport: this.ui?.mode === "fullscreen" };
	};

	prototype.addChild = function addChildWithoutLeadingSpacer(
		child: unknown,
	): void {
		if (this[LEADING_SPACER_SKIPPED] !== true && child instanceof Spacer) {
			this[LEADING_SPACER_SKIPPED] = true;
			return;
		}

		originalAddChild.call(this, child);
	};

	// Strip the unconditional blank line that self-rendering tools prepend.
	// The upstream ToolExecutionComponent.render() always does
	//   lines.push("");
	//   lines.push(...contentLines);
	// when getRenderShell() === "self", which injects one blank line
	// between every consecutive tool call in the compact Tron view.
	prototype.render = function renderWithoutLeadingBlankLine(
		width: number,
	): string[] {
		const lines = originalRender.call(this, width);
		// Remove the leading empty string that self-rendering tools inject.
		const removedRows = lines.length > 0 && lines[0] === "" ? 1 : 0;
		this[RENDERED_BOUNDS] = { width, height: lines.length - removedRows, removedRows };
		return removedRows ? lines.slice(removedRows) : lines;
	};

	if (originalHandleMouse) {
		prototype.handleMouse = function handleMouseWithoutLeadingBlankLine(event) {
			const bounds = this[RENDERED_BOUNDS];
			if (!bounds || event.width !== bounds.width || event.x < 0 || event.x >= bounds.width
				|| event.y < 0 || event.y >= Math.min(bounds.height, event.height)) return undefined;
			// Pi's existing regions own expansion and child-control priority. Restore
			// only the row we removed, keeping absolute screen coordinates intact.
			return originalHandleMouse.call(this, {
				...event,
				y: event.y + bounds.removedRows,
				height: event.height + bounds.removedRows,
			});
		};
	}

	toolExecutionSpacingPatchApplied = true;
}
