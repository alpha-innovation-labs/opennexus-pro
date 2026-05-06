import { Key, matchesKey, type TUI } from "@mariozechner/pi-tui";
import {
	SharedModal,
	type SelectPreviewTheme,
} from "@nexus/tui-kit/modal/index.js";
import { clampSystemPromptScrollOffset } from "./clampSystemPromptScrollOffset.js";
import { getDefaultSystemPromptModalRows } from "./getDefaultSystemPromptModalRows.js";
import { getSystemPromptViewportHeight } from "./getSystemPromptViewportHeight.js";
import { openSystemPromptExternalEditor } from "./openSystemPromptExternalEditor.js";
import { renderSystemPromptLines } from "./renderSystemPromptLines.js";
import type { SystemPromptModalAction } from "./types.js";

/**
 * Displays the effective system prompt and exposes edit/reset actions.
 */
export class SystemPromptModal extends SharedModal {
	focused = true;
	private currentInnerWidth = Math.max(1, process.stdout.columns || 120);
	private pendingGoToTop = false;
	private scrollOffset = 0;

	/**
	 * Creates a system prompt viewer modal.
	 *
	 * @param theme Modal theme.
	 * @param prompt Prompt text to render.
	 * @param isCustom Whether the prompt is currently user-overridden.
	 * @param done Completes the modal with the selected action.
	 * @param onRenderNeeded Requests a modal repaint after scroll changes.
	 * @param getRowCount Returns current fullscreen row count.
	 */
	constructor(
		private readonly uiTheme: SelectPreviewTheme,
		private readonly prompt: string,
		isCustom: boolean,
		private readonly done: (action: SystemPromptModalAction) => void,
		private readonly tui?: TUI,
		private readonly onRenderNeeded: () => void = () => {},
		private readonly getRowCount: () => number = getDefaultSystemPromptModalRows,
	) {
		super({
			footerLines: [],
			fullScreen: true,
			fullScreenRows: getRowCount,
			headerLines: [
				uiTheme.fg(
					"accent",
					`● System Prompt ${isCustom ? "(custom)" : "(default)"}`,
				),
			],
			onClose: () => done({ type: "close" }),
			panes: [],
			theme: uiTheme,
		});
	}

	/**
	 * Handles edit, reset, close, and Vim-style scroll shortcuts.
	 *
	 * @param data Raw terminal input.
	 */
	override handleInput(data: string): void {
		if (data === "j") return this.scrollBy(1);
		if (data === "k") return this.scrollBy(-1);
		if (data === "g") return this.handleGoPrefix();
		if (data === "G") return this.scrollToBottom();
		this.pendingGoToTop = false;

		if (matchesKey(data, Key.ctrl("g"))) {
			this.openExternalEditor();
			return;
		}
		if (data === "e") {
			this.done({ type: "edit" });
			return;
		}
		if (data === "r") {
			this.done({ type: "reset" });
			return;
		}
		if (
			data === "q" ||
			matchesKey(data, Key.escape) ||
			matchesKey(data, Key.ctrl("c"))
		) {
			this.done({ type: "close" });
		}
	}

	/**
	 * Renders the fullscreen prompt viewer modal.
	 *
	 * @param width Available terminal width.
	 * @returns Rendered modal rows.
	 */
	override render(width: number): string[] {
		const innerWidth = Math.max(1, width - 2);
		this.currentInnerWidth = innerWidth;
		const allLines = renderSystemPromptLines(
			this.prompt,
			innerWidth,
			this.uiTheme,
		);
		const viewportHeight = getSystemPromptViewportHeight(this.getRowCount());
		this.scrollOffset = clampSystemPromptScrollOffset(
			this.scrollOffset,
			allLines.length,
			viewportHeight,
		);
		const visibleLines = allLines.slice(
			this.scrollOffset,
			this.scrollOffset + viewportHeight,
		);

		this.footerLines = [
			this.uiTheme.fg(
				"dim",
				"j/k scroll · gg top · Shift+G bottom · e/Ctrl+G edit · r reset · q close",
			),
		];
		this.panes = [{ id: "system-prompt", lines: visibleLines, size: 1 }];
		return super.render(width);
	}

	/**
	 * Opens the same external editor path used by Pi's extension editor.
	 */
	private openExternalEditor(): void {
		if (!this.tui) {
			this.done({ type: "edit" });
			return;
		}
		const updated = openSystemPromptExternalEditor(this.tui, this.prompt);
		if (updated !== undefined) this.done({ type: "update", prompt: updated });
	}

	/**
	 * Handles the first or second `g` in the `gg` shortcut.
	 */
	private handleGoPrefix(): void {
		if (this.pendingGoToTop) {
			this.pendingGoToTop = false;
			this.scrollToTop();
			return;
		}
		this.pendingGoToTop = true;
	}

	/**
	 * Scrolls the prompt by a relative amount.
	 *
	 * @param delta Row count to move.
	 */
	private scrollBy(delta: number): void {
		this.pendingGoToTop = false;
		this.scrollOffset = clampSystemPromptScrollOffset(
			this.scrollOffset + delta,
			this.getLineCount(),
			this.getViewportHeight(),
		);
		this.onRenderNeeded();
	}

	/**
	 * Scrolls to the first prompt line.
	 */
	private scrollToTop(): void {
		this.scrollOffset = 0;
		this.onRenderNeeded();
	}

	/**
	 * Scrolls to the final prompt line.
	 */
	private scrollToBottom(): void {
		this.pendingGoToTop = false;
		this.scrollOffset = clampSystemPromptScrollOffset(
			Number.POSITIVE_INFINITY,
			this.getLineCount(),
			this.getViewportHeight(),
		);
		this.onRenderNeeded();
	}

	/**
	 * Returns the rendered prompt line count.
	 *
	 * @returns Total prompt lines for the current terminal width.
	 */
	private getLineCount(): number {
		return renderSystemPromptLines(
			this.prompt,
			this.currentInnerWidth,
			this.uiTheme,
		).length;
	}

	/**
	 * Returns visible prompt content rows.
	 *
	 * @returns Viewport height.
	 */
	private getViewportHeight(): number {
		return getSystemPromptViewportHeight(this.getRowCount());
	}
}
