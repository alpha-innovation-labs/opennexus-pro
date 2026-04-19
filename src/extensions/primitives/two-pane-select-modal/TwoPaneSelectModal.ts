import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { Container } from "@mariozechner/pi-tui";
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

	/**
	 * Replaces selectable items.
	 *
	 * @param items Next modal items.
	 */
	setItems(items: AutocompleteItem[]): void {
		this.items = items;
		this.selectList = createSelectList(this.uiTheme, this.listHeight, this.onPick, this.onClose, this.onSelectionChange, this.itemStyles, this.itemMaxLines, items);
		this.onSelectionChange?.(items[0] ?? null);
	}

	/**
	 * Updates the pick handler.
	 *
	 * @param onPick Pick callback.
	 */
	setOnPick(onPick: (item: AutocompleteItem) => void): void {
		this.onPick = onPick;
		this.selectList = createSelectList(this.uiTheme, this.listHeight, this.onPick, this.onClose, this.onSelectionChange, this.itemStyles, this.itemMaxLines, this.items);
	}

	/**
	 * Updates the close handler.
	 *
	 * @param onClose Close callback.
	 */
	setOnClose(onClose: () => void): void {
		this.onClose = onClose;
		this.selectList = createSelectList(this.uiTheme, this.listHeight, this.onPick, this.onClose, this.onSelectionChange, this.itemStyles, this.itemMaxLines, this.items);
	}

	/**
	 * Updates the selection-change handler.
	 *
	 * @param onSelectionChange Selection callback.
	 */
	setOnSelectionChange(onSelectionChange?: (item: AutocompleteItem | null) => void): void {
		this.onSelectionChange = onSelectionChange;
		this.selectList = createSelectList(this.uiTheme, this.listHeight, this.onPick, this.onClose, this.onSelectionChange, this.itemStyles, this.itemMaxLines, this.items);
	}

	/**
	 * Replaces right-pane preview lines.
	 *
	 * @param lines Preview lines.
	 */
	setRightLines(lines: string[]): void {
		this.rightLines = lines;
	}

	/**
	 * Updates pane titles.
	 *
	 * @param leftTitle Left pane title.
	 * @param rightTitle Right pane title.
	 */
	setTitles(leftTitle: string, rightTitle: string): void {
		this.leftTitle = leftTitle;
		this.rightTitle = rightTitle;
	}

	/**
	 * Configures the optional bottom input row.
	 *
	 * @param title Bottom row title.
	 * @param value Bottom row value.
	 * @param prefix Bottom row prefix.
	 */
	setBottom(title: string | undefined, value: string, prefix = this.bottomPrefix): void {
		this.bottomTitle = title;
		this.bottomValue = value;
		this.bottomPrefix = prefix;
	}

	/**
	 * Forwards terminal input to the list.
	 *
	 * @param data Raw terminal input.
	 */
	handleInput(data: string): void {
		this.selectList.handleInput(data);
	}

	/**
	 * Invalidates child render state.
	 */
	invalidate(): void {
		this.selectList.invalidate();
	}

	/**
	 * Moves the current selection by one or more rows.
	 *
	 * @param delta Relative row movement.
	 */
	protected moveSelection(delta: number): void {
		this.selectList.moveBy(delta);
	}

	/**
	 * Jumps to the next matching item.
	 *
	 * @param predicate Match predicate.
	 * @param direction Search direction.
	 */
	protected jumpSelection(predicate: (item: AutocompleteItem) => boolean, direction: 1 | -1): void {
		this.selectList.jumpToMatch(predicate, direction);
	}

	/**
	 * Selects an item by value when present.
	 *
	 * @param value Item value.
	 */
	protected selectValue(value: string): void {
		this.selectList.selectValue(value);
	}

	/**
	 * Returns the current selection.
	 *
	 * @returns Selected item or null.
	 */
	protected getSelectedItem(): AutocompleteItem | null {
		return this.selectList.getSelectedItem();
	}

	/**
	 * Renders the modal body.
	 *
	 * @param width Available terminal width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		const dialogWidth = Math.max(80, Math.min(width, Math.floor(width * 0.9)));
		const innerWidth = Math.max(78, dialogWidth - 2);
		const splitPane = this.showLeftPane && this.showRightPane;
		const { leftWidth, rightWidth, singlePaneWidth } = computePaneWidths(innerWidth, splitPane, this.leftPaneRatio, this.leftPaneMaxWidth);
		const terminalRows = process.stdout.rows ?? 30;
		const bodyHeight = Math.max(12, Math.floor(terminalRows * 0.8) - 4);
		const listHeight = this.bottomTitle ? bodyHeight - 2 : bodyHeight;
		if (this.listHeight !== listHeight) {
			this.listHeight = listHeight;
			this.selectList = createSelectList(this.uiTheme, this.listHeight, this.onPick, this.onClose, this.onSelectionChange, this.itemStyles, this.itemMaxLines, this.items);
		}
		const listLines = this.selectList.render(splitPane ? leftWidth : singlePaneWidth).slice(0, listHeight);
		const leftLines = [...listLines];
		while (leftLines.length < listHeight) leftLines.push("");
		const right = this.rightLines.slice(0, bodyHeight);
		while (right.length < bodyHeight) right.push("");
		const lines = [renderTopLine(this.uiTheme, this.showLeftPane, this.showRightPane, this.leftTitle, this.rightTitle, leftWidth, rightWidth)];
		for (let i = 0; i < listHeight; i += 1) {
			lines.push(renderRow(this.uiTheme, this.showLeftPane, this.showRightPane, leftLines[i] || "", right[i] || "", leftWidth, rightWidth));
		}
		if (this.bottomTitle) {
			lines.push(...renderBottomSection(this.uiTheme, this.showLeftPane, this.showRightPane, this.bottomTitle, this.bottomPrefix, this.bottomValue, leftWidth, rightWidth, right, listHeight));
		}
		lines.push(this.uiTheme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`));
		return lines;
	}
}
