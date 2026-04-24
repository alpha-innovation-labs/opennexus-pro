import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { Key, matchesKey, Container } from "@mariozechner/pi-tui";
import { computePaneWidths } from "./computePaneWidths.js";
import { createSelectList } from "./createSelectList.js";
import { renderBottomSection } from "./renderBottomSection.js";
import { renderRow } from "./renderRow.js";
import { renderTopLine } from "./renderTopLine.js";
import type { PlainSelectList } from "./PlainSelectList.js";
import type { TwoPaneSelectModalOptions, UITheme } from "./types.js";

/**
 * Framed modal with selectable left pane and preview right pane.
 */
export class TwoPaneSelectModal extends Container {
	focused = true;
	private items: AutocompleteItem[] = [];
	private selectList: PlainSelectList;
	private rightLines: string[] = [];
	private listHeight = 16;
	private leftTitle: string;
	private rightTitle: string;
	private bottomTitle?: string;
	private bottomValue = "";
	private bottomPrefix = "> ";
	private readonly showLeftPane: boolean;
	private readonly showRightPane: boolean;
	private readonly leftPaneRatio: number;
	private readonly leftPaneMaxWidth?: number;
	private readonly itemStyles?: TwoPaneSelectModalOptions["itemStyles"];
	private readonly itemMaxLines?: TwoPaneSelectModalOptions["itemMaxLines"];
	private activePane: "left" | "right" = "left";
	private rightScrollOffset = 0;
	private pendingRightGotoStart = false;

	constructor(
		private readonly uiTheme: UITheme,
		private onPick: (item: AutocompleteItem) => void,
		private onClose: () => void,
		private onSelectionChange?: (item: AutocompleteItem | null) => void,
		options?: TwoPaneSelectModalOptions,
	) {
		super();
		this.leftTitle = options?.leftTitle ?? "Results";
		this.rightTitle = options?.rightTitle ?? "Preview";
		this.bottomTitle = options?.bottomTitle;
		this.bottomPrefix = options?.bottomPrefix ?? "> ";
		this.showLeftPane = options?.showLeftPane ?? true;
		this.showRightPane = options?.showRightPane ?? true;
		this.leftPaneRatio = Math.max(0.1, Math.min(0.9, options?.leftPaneRatio ?? 0.5));
		this.leftPaneMaxWidth = options?.leftPaneMaxWidth;
		this.itemStyles = options?.itemStyles;
		this.itemMaxLines = options?.itemMaxLines;
		this.selectList = createSelectList(this.uiTheme, this.listHeight, this.onPick, this.onClose, this.onSelectionChange, this.itemStyles, this.itemMaxLines, []);
	}

	setItems(items: AutocompleteItem[]): void {
		this.items = items;
		this.selectList = createSelectList(this.uiTheme, this.listHeight, this.onPick, this.onClose, this.onSelectionChange, this.itemStyles, this.itemMaxLines, items);
		this.onSelectionChange?.(items[0] ?? null);
	}

	setOnPick(onPick: (item: AutocompleteItem) => void): void {
		this.onPick = onPick;
		this.selectList = createSelectList(this.uiTheme, this.listHeight, this.onPick, this.onClose, this.onSelectionChange, this.itemStyles, this.itemMaxLines, this.items);
	}

	setOnClose(onClose: () => void): void {
		this.onClose = onClose;
		this.selectList = createSelectList(this.uiTheme, this.listHeight, this.onPick, this.onClose, this.onSelectionChange, this.itemStyles, this.itemMaxLines, this.items);
	}

	setOnSelectionChange(onSelectionChange?: (item: AutocompleteItem | null) => void): void {
		this.onSelectionChange = onSelectionChange;
		this.selectList = createSelectList(this.uiTheme, this.listHeight, this.onPick, this.onClose, this.onSelectionChange, this.itemStyles, this.itemMaxLines, this.items);
	}

	setRightLines(lines: string[]): void {
		this.rightLines = lines;
		this.rightScrollOffset = 0;
		this.pendingRightGotoStart = false;
	}

	setTitles(leftTitle: string, rightTitle: string): void {
		this.leftTitle = leftTitle;
		this.rightTitle = rightTitle;
	}

	setBottom(title: string | undefined, value: string, prefix = this.bottomPrefix): void {
		this.bottomTitle = title;
		this.bottomValue = value;
		this.bottomPrefix = prefix;
	}

	handleInput(data: string): void {
		if (this.activePane === "right") {
			if (matchesKey(data, Key.ctrl("c"))) {
				this.onClose();
				return;
			}
			if (matchesKey(data, Key.escape)) {
				this.activePane = "left";
				return;
			}
			if (data === "G") {
				this.scrollRightToEnd();
				return;
			}
			if (data === "g") {
				if (this.pendingRightGotoStart) {
					this.pendingRightGotoStart = false;
					this.rightScrollOffset = 0;
					return;
				}
				this.pendingRightGotoStart = true;
				return;
			}
			this.pendingRightGotoStart = false;
			if (data === "j" || matchesKey(data, Key.down) || matchesKey(data, Key.ctrl("n"))) {
				this.scrollRightBy(1);
				return;
			}
			if (data === "k" || matchesKey(data, Key.up) || matchesKey(data, Key.ctrl("p"))) {
				this.scrollRightBy(-1);
				return;
			}
			return;
		}
		this.selectList.handleInput(data);
	}

	invalidate(): void {
		this.selectList.invalidate();
	}

	protected moveSelection(delta: number): void {
		this.selectList.moveBy(delta);
	}

	protected jumpSelection(predicate: (item: AutocompleteItem) => boolean, direction: 1 | -1): void {
		this.selectList.jumpToMatch(predicate, direction);
	}

	protected selectValue(value: string): void {
		this.selectList.selectValue(value);
	}

	protected getSelectedItem(): AutocompleteItem | null {
		return this.selectList.getSelectedItem();
	}

	protected focusRightPane(): void {
		if (!this.showRightPane) return;
		this.activePane = "right";
		this.pendingRightGotoStart = false;
	}

	protected isRightPaneFocused(): boolean {
		return this.activePane === "right";
	}

	private scrollRightBy(delta: number): void {
		const visibleHeight = Math.max(1, this.getBodyHeight());
		const maxOffset = Math.max(0, this.rightLines.length - visibleHeight);
		this.rightScrollOffset = Math.max(0, Math.min(maxOffset, this.rightScrollOffset + delta));
	}

	protected scrollRightToEnd(): void {
		const visibleHeight = Math.max(1, this.getBodyHeight());
		this.rightScrollOffset = Math.max(0, this.rightLines.length - visibleHeight);
		this.pendingRightGotoStart = false;
	}

	private getBodyHeight(): number {
		const terminalRows = process.stdout.rows ?? 30;
		return Math.max(12, Math.floor(terminalRows * 0.8) - 4);
	}

	render(width: number): string[] {
		const dialogWidth = Math.max(80, Math.min(width, Math.floor(width * 0.9)));
		const innerWidth = Math.max(78, dialogWidth - 2);
		const splitPane = this.showLeftPane && this.showRightPane;
		const activeLeftPaneRatio = this.activePane === "left" ? 0.6 : 0.3;
		const { leftWidth, rightWidth, singlePaneWidth } = computePaneWidths(
			innerWidth,
			splitPane,
			splitPane ? activeLeftPaneRatio : this.leftPaneRatio,
			this.leftPaneMaxWidth,
		);
		const bodyHeight = this.getBodyHeight();
		const listHeight = this.bottomTitle ? bodyHeight - 2 : bodyHeight;
		if (this.listHeight !== listHeight) {
			const selectedValue = this.getSelectedItem()?.value;
			let suppressResizeSelectionChange = true;
			this.listHeight = listHeight;
			this.selectList = createSelectList(
				this.uiTheme,
				this.listHeight,
				this.onPick,
				this.onClose,
				(item) => {
					if (!suppressResizeSelectionChange) this.onSelectionChange?.(item);
				},
				this.itemStyles,
				this.itemMaxLines,
				this.items,
			);
			if (selectedValue) this.selectList.selectValue(selectedValue);
			suppressResizeSelectionChange = false;
		}
		const listLines = this.selectList.render(splitPane ? leftWidth : singlePaneWidth).slice(0, listHeight);
		const leftLines = [...listLines];
		while (leftLines.length < listHeight) leftLines.push("");
		const visibleRight = this.rightLines.slice(this.rightScrollOffset, this.rightScrollOffset + bodyHeight);
		while (visibleRight.length < bodyHeight) visibleRight.push("");
		const focusedLeftTitle = this.activePane === "left" ? `● ${this.leftTitle}` : `○ ${this.leftTitle}`;
		const focusedRightTitle = this.activePane === "right" ? `● ${this.rightTitle}` : `○ ${this.rightTitle}`;
		const lines = [renderTopLine(this.uiTheme, this.showLeftPane, this.showRightPane, focusedLeftTitle, focusedRightTitle, leftWidth, rightWidth)];
		for (let i = 0; i < listHeight; i += 1) {
			lines.push(renderRow(this.uiTheme, this.showLeftPane, this.showRightPane, leftLines[i] || "", visibleRight[i] || "", leftWidth, rightWidth));
		}
		if (this.bottomTitle) {
			lines.push(...renderBottomSection(this.uiTheme, this.showLeftPane, this.showRightPane, this.bottomTitle, this.bottomPrefix, this.bottomValue, leftWidth, rightWidth, visibleRight, listHeight));
		}
		lines.push(this.uiTheme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`));
		return lines;
	}
}
