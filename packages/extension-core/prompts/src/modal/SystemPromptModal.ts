import { Key, matchesKey, type TUI } from "@earendil-works/pi-tui";
import { renderSharedModalPaneLines } from "@nexus/tui-kit/modal/renderSharedModalPaneLines";
import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/select/types";
import { extractAgentsSection } from "./agents-section/extractAgentsSection";
import { replaceAgentsSection } from "./agents-section/replaceAgentsSection";
import { extractAppendSection } from "./append-section/extractAppendSection";
import { replaceAppendSection } from "./append-section/replaceAppendSection";
import { clampSystemPromptScrollOffset } from "./clampSystemPromptScrollOffset";
import { getSelectedSystemPromptContent } from "./content/getSelectedSystemPromptContent";
import { createSystemPromptFooterHotkeys } from "./createSystemPromptFooterHotkeys";
import { getDefaultSystemPromptModalRows } from "./getDefaultSystemPromptModalRows";
import { getSystemPromptViewportHeight } from "./getSystemPromptViewportHeight";
import { openSystemPromptExternalEditor } from "./openSystemPromptExternalEditor";
import { createSystemPromptOutlineRows } from "./outline/createSystemPromptOutlineRows";
import { renderSystemPromptOutlineRows } from "./outline/renderSystemPromptOutlineRows";
import { renderSystemPromptModalFrame } from "./renderSystemPromptModalFrame";
import { padPaneLinesToHeight } from "./scroll/padPaneLinesToHeight";
import { renderPaneScrollbar } from "./scroll/renderPaneScrollbar";
import { createNativeSystemToolMarkdown } from "./tools/createNativeSystemToolMarkdown";
import type { SystemPromptModalAction } from "./types";

/**
 * Displays the effective system prompt and exposes edit/reset actions.
 */
export class SystemPromptModal {
	focused = true;
	private activePane: "left" | "right" = "left";
	private currentInnerWidth = Math.max(1, process.stdout.columns || 120);
	private leftScrollOffset = 0;
	private pendingGoToTop = false;
	private rightScrollOffset = 0;
	private selectedOutlineIndex = 1;

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
		_isCustom: boolean,
		private readonly done: (action: SystemPromptModalAction) => void,
		private readonly tui?: TUI,
		private readonly onRenderNeeded: () => void = () => {},
		private readonly getRowCount: () => number = getDefaultSystemPromptModalRows,
	) {}

	/**
	 * Handles edit, reset, close, and Vim-style scroll shortcuts.
	 *
	 * @param data Raw terminal input.
	 */
	handleInput(data: string): void {
		if (matchesKey(data, Key.tab)) {
			this.toggleFocusedPane();
			return;
		}
		if (data === "h") {
			this.focusPane("left");
			return;
		}
		if (data === "l") {
			this.focusPane("right");
			return;
		}
		if (data === "j" || matchesKey(data, Key.down)) {
			this.moveFocusedPane(1);
			return;
		}
		if (data === "k" || matchesKey(data, Key.up)) {
			this.moveFocusedPane(-1);
			return;
		}
		if (data === "g") {
			this.handleGoPrefix();
			return;
		}
		if (data === "G") {
			this.scrollRightToBottom();
			return;
		}
		this.pendingGoToTop = false;

		if (matchesKey(data, Key.ctrl("g"))) {
			this.openEditableSectionEditor();
			return;
		}
		if (data === "e") {
			this.openEditableSectionEditor();
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
	render(width: number): string[] {
		const innerWidth = Math.max(1, width - 2);
		const leftWidth = Math.max(20, Math.floor((innerWidth - 1) * 0.2));
		const rightWidth = Math.max(1, innerWidth - leftWidth - 1);
		this.currentInnerWidth = rightWidth;
		const outlineRows = createSystemPromptOutlineRows(this.prompt);
		this.selectedOutlineIndex = this.clampToSelectableOutlineIndex(
			outlineRows,
			this.selectedOutlineIndex,
		);
		const selectedContent = this.getSelectedContent(outlineRows);
		const allLines = renderSharedModalPaneLines(
			this.uiTheme,
			{
				id: "system-prompt",
				lines: selectedContent.split("\n"),
				contentType: "markdown",
				size: 4,
			},
			rightWidth,
		);
		const viewportHeight = getSystemPromptViewportHeight(this.getRowCount());
		this.rightScrollOffset = clampSystemPromptScrollOffset(
			this.rightScrollOffset,
			allLines.length,
			viewportHeight,
		);
		this.leftScrollOffset = clampSystemPromptScrollOffset(
			this.leftScrollOffset,
			outlineRows.length,
			viewportHeight,
		);
		const visibleLines = allLines.slice(
			this.rightScrollOffset,
			this.rightScrollOffset + viewportHeight,
		);
		const outlineLines = renderSystemPromptOutlineRows(
			outlineRows,
			this.selectedOutlineIndex,
			this.activePane === "left",
			this.uiTheme,
		).slice(this.leftScrollOffset, this.leftScrollOffset + viewportHeight);
		const paddedOutline = padPaneLinesToHeight(outlineLines, viewportHeight);
		const paddedContent = padPaneLinesToHeight(visibleLines, viewportHeight);

		return renderSystemPromptModalFrame(
			this.uiTheme,
			width,
			this.uiTheme.fg("accent", "● System Prompt"),
			[
				{
					lines:
						this.activePane === "left"
							? renderPaneScrollbar(
									paddedOutline,
									leftWidth,
									this.leftScrollOffset,
									outlineRows.length,
									this.uiTheme,
								)
							: paddedOutline,
					width: leftWidth,
				},
				{
					lines: renderPaneScrollbar(
						paddedContent,
						rightWidth,
						this.rightScrollOffset,
						Math.max(allLines.length, paddedContent.length + 1),
						this.uiTheme,
					),
					width: rightWidth,
				},
			],
			createSystemPromptFooterHotkeys(
				this.getSelectedEditableSection(outlineRows) !== undefined,
			),
		);
	}

	/**
	 * Opens the same external editor path used by Pi's extension editor.
	 */
	private openEditableSectionEditor(): void {
		const section = this.getSelectedEditableSection();
		if (section === undefined || !this.tui) return;
		const current =
			section === "append"
				? extractAppendSection(this.prompt)
				: extractAgentsSection(this.prompt);
		const updated = openSystemPromptExternalEditor(this.tui, current);
		if (updated === undefined) return;
		this.done({
			type: "update",
			prompt:
				section === "append"
					? replaceAppendSection(this.prompt, updated)
					: replaceAgentsSection(this.prompt, updated),
		});
	}

	/**
	 * Handles the first or second `g` in the `gg` shortcut.
	 */
	private handleGoPrefix(): void {
		if (this.pendingGoToTop) {
			this.pendingGoToTop = false;
			this.scrollRightToTop();
			return;
		}
		this.pendingGoToTop = true;
	}

	/**
	 * Scrolls the prompt by a relative amount.
	 *
	 * @param delta Row count to move.
	 */
	private moveFocusedPane(delta: number): void {
		this.pendingGoToTop = false;
		if (this.activePane === "left") {
			const rows = createSystemPromptOutlineRows(this.prompt);
			this.selectedOutlineIndex = this.findNextSelectableOutlineIndex(
				rows,
				delta,
			);
			this.rightScrollOffset = 0;
			this.syncLeftSelectionIntoView(rows.length);
			this.onRenderNeeded();
			return;
		}
		this.rightScrollOffset = clampSystemPromptScrollOffset(
			this.rightScrollOffset + delta,
			this.getLineCount(),
			this.getViewportHeight(),
		);
		this.onRenderNeeded();
	}

	/** Toggles keyboard focus between outline and content panes. */
	private toggleFocusedPane(): void {
		this.focusPane(this.activePane === "left" ? "right" : "left");
	}

	/** Focuses one modal pane. */
	private focusPane(pane: "left" | "right"): void {
		this.pendingGoToTop = false;
		this.activePane = pane;
		this.onRenderNeeded();
	}

	/** Scrolls selected right-pane content to the first line. */
	private scrollRightToTop(): void {
		this.rightScrollOffset = 0;
		this.onRenderNeeded();
	}

	/** Scrolls selected right-pane content to the final line. */
	private scrollRightToBottom(): void {
		this.pendingGoToTop = false;
		this.rightScrollOffset = clampSystemPromptScrollOffset(
			Number.POSITIVE_INFINITY,
			this.getLineCount(),
			this.getViewportHeight(),
		);
		this.onRenderNeeded();
	}

	/** Finds the next selectable outline row in the requested direction. */
	private findNextSelectableOutlineIndex(
		rows: ReturnType<typeof createSystemPromptOutlineRows>,
		delta: number,
	): number {
		let index = this.selectedOutlineIndex;
		while (index + delta >= 0 && index + delta < rows.length) {
			index += delta;
			if (rows[index]?.selectable) return index;
		}
		return this.selectedOutlineIndex;
	}

	/** Clamps a selected outline row to a selectable row. */
	private clampToSelectableOutlineIndex(
		rows: ReturnType<typeof createSystemPromptOutlineRows>,
		index: number,
	): number {
		if (rows[index]?.selectable) return index;
		const next = rows.findIndex((row) => row.selectable);
		return next >= 0 ? next : 0;
	}

	/** Keeps the selected outline row visible in the left pane. */
	private syncLeftSelectionIntoView(rowCount: number): void {
		const viewportHeight = this.getViewportHeight();
		if (this.selectedOutlineIndex < this.leftScrollOffset)
			this.leftScrollOffset = this.selectedOutlineIndex;
		if (this.selectedOutlineIndex >= this.leftScrollOffset + viewportHeight)
			this.leftScrollOffset = this.selectedOutlineIndex - viewportHeight + 1;
		this.leftScrollOffset = clampSystemPromptScrollOffset(
			this.leftScrollOffset,
			rowCount,
			viewportHeight,
		);
	}

	/**
	 * Returns the rendered prompt line count.
	 *
	 * @returns Total prompt lines for the current terminal width.
	 */
	private getLineCount(): number {
		const rows = createSystemPromptOutlineRows(this.prompt);
		const selectedContent = this.getSelectedContent(rows);
		return renderSharedModalPaneLines(
			this.uiTheme,
			{
				id: "system-prompt",
				lines: selectedContent.split("\n"),
				contentType: "markdown",
				size: 4,
			},
			this.currentInnerWidth,
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

	/** No-op invalidator for Component compatibility. */
	invalidate(): void {}

	/** Returns the editable user-prompt section selected in the outline. */
	private getSelectedEditableSection(
		rows = createSystemPromptOutlineRows(this.prompt),
	): "append" | "agents" | undefined {
		const row = rows[this.selectedOutlineIndex];
		if (row?.section.label !== "User Prompt") return undefined;
		if (row.child?.label === "Content") return "append";
		if (row.child?.label === "AGENTS.md") return "agents";
		return undefined;
	}

	/** Returns selected right-pane content, including native tool parameter docs. */
	private getSelectedContent(
		rows: ReturnType<typeof createSystemPromptOutlineRows>,
	): string {
		const selectedRow = rows[this.selectedOutlineIndex];
		if (
			selectedRow?.section.label === "Tools" &&
			selectedRow.child !== undefined
		) {
			return (
				createNativeSystemToolMarkdown(selectedRow.child.label) ??
				selectedRow.child.label
			);
		}
		return getSelectedSystemPromptContent(
			this.prompt,
			rows,
			this.selectedOutlineIndex,
		);
	}
}
