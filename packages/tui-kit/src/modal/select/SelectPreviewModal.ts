import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { SharedModal } from "../SharedModal.js";
import { computeModalWidth } from "../computeModalWidth.js";
import { computePaneWidths as computeSharedPaneWidths } from "../computePaneWidths.js";
import { createRightPaneLines } from "./createRightPaneLines.js";
import { createSelectList } from "./createSelectList.js";
import { SHARED_MODAL_FOOTER_BORDER } from "../SHARED_MODAL_FOOTER_BORDER.js";
import { createTwoPaneFooterLine } from "./createTwoPaneFooterLine.js";
import { createTwoPaneHeaderLine } from "./createTwoPaneHeaderLine.js";
import { createTwoPaneShells } from "./createTwoPaneShells.js";
import { getTwoPaneBodyHeight } from "./getTwoPaneBodyHeight.js";
import { handleTwoPaneRightInput } from "./handleTwoPaneRightInput.js";
import type { PlainSelectList } from "./PlainSelectList.js";
import type { SelectPreviewModalOptions, SelectPreviewTheme } from "./types.js";

/** Framed selectable list with an optional preview pane, backed by SharedModal. */
export class SelectPreviewModal extends SharedModal {
  focused = true;
  private activePane: "left" | "right" = "left";
  private bottomPrefix = "> ";
  private bottomTitle?: string;
  private bottomValue = "";
  private items: AutocompleteItem[] = [];
  private leftTitle: string;
  private listHeight = 16;
  private showHeaderFocusMarkers = true;
  private onSelectionChange?: (item: AutocompleteItem | null) => void;
  private pendingRightGotoStart = false;
  private fullScreen: boolean;
  private readonly itemMaxLines?: SelectPreviewModalOptions["itemMaxLines"];
  private readonly itemStyles?: SelectPreviewModalOptions["itemStyles"];
  private readonly leftPaneMaxWidth?: number;
  private modalMaxWidth?: number;
  private modalMaxWidthRatio: number;
  private modalMinWidth: number;
  private readonly leftPaneRatio: number;
  private footerHintLines: string[] = [];
  private rightLines: string[] = [];
  private rightScrollOffset = 0;
  private rightTitle: string;
  private selectList: PlainSelectList;
  private showLeftPane: boolean;
  private showRightPane: boolean;

  /** Creates a shared select-preview modal. */
  constructor(
    private readonly uiTheme: SelectPreviewTheme,
    private onPick: (item: AutocompleteItem) => void,
    private closeHandler: () => void,
    onSelectionChange?: (item: AutocompleteItem | null) => void,
    options?: SelectPreviewModalOptions,
  ) {
    super({ theme: uiTheme, panes: [], minWidth: options?.minWidth ?? 80, maxWidth: options?.maxWidth, maxWidthRatio: options?.maxWidthRatio ?? 0.9, fullScreen: options?.fullScreen, onClose: closeHandler });
    this.fullScreen = options?.fullScreen ?? false;
    this.modalMinWidth = options?.minWidth ?? 80;
    this.modalMaxWidth = options?.maxWidth;
    this.modalMaxWidthRatio = options?.maxWidthRatio ?? 0.9;
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
    this.onSelectionChange = onSelectionChange;
    this.selectList = this.createList([]);
  }

  /** Replaces selectable items. */
  setItems(items: AutocompleteItem[]): void { this.items = items; this.selectList = this.createList(items); this.onSelectionChange?.(items[0] ?? null); }

  /** Updates the item pick callback. */
  setOnPick(onPick: (item: AutocompleteItem) => void): void { this.onPick = onPick; this.selectList = this.createList(this.items); }

  /** Updates the close callback. */
  setOnClose(onClose: () => void): void { this.closeHandler = onClose; this.selectList = this.createList(this.items); }

  /** Updates the selection change callback. */
  setOnSelectionChange(onSelectionChange?: (item: AutocompleteItem | null) => void): void { this.onSelectionChange = onSelectionChange; this.selectList = this.createList(this.items); }

  /** Updates right preview lines. */
  setRightLines(lines: string[]): void { this.rightLines = lines; this.rightScrollOffset = 0; this.pendingRightGotoStart = false; }

  /** Updates visible pane titles. */
  setTitles(leftTitle: string, rightTitle: string): void { this.leftTitle = leftTitle; this.rightTitle = rightTitle; }

  /** Updates whether the header shows focus markers. */
  setHeaderFocusMarkers(visible: boolean): void { this.showHeaderFocusMarkers = visible; }

  /** Updates the footer prompt line. */
  setBottom(title: string | undefined, value: string, prefix = this.bottomPrefix): void { this.bottomTitle = title; this.bottomValue = value; this.bottomPrefix = prefix; }

  /** Updates helper footer lines rendered above the prompt line. */
  setFooterHintLines(lines: string[]): void { this.footerHintLines = lines; }

  /** Updates visible pane set. */
  setPaneVisibility(showLeftPane: boolean, showRightPane: boolean): void { this.showLeftPane = showLeftPane; this.showRightPane = showRightPane; }

  /** Updates whether the modal fills the terminal width and height. */
  setFullScreenMode(fullScreen: boolean): void {
    this.fullScreen = fullScreen;
    this.setWidthPolicy(this.modalMinWidth, this.modalMaxWidth, this.modalMaxWidthRatio, this.fullScreen);
  }

  /** Updates modal width policy. */
  setModalWidthPolicy(minWidth: number, maxWidth?: number, maxWidthRatio = this.modalMaxWidthRatio): void {
    this.modalMinWidth = minWidth;
    this.modalMaxWidth = maxWidth;
    this.modalMaxWidthRatio = maxWidthRatio;
    this.setWidthPolicy(minWidth, maxWidth, maxWidthRatio, this.fullScreen);
  }

  /** Routes keyboard input to the focused pane. */
  override handleInput(data: string): void {
    if (this.activePane !== "right") return this.selectList.handleInput(data);
    const result = handleTwoPaneRightInput({ data, pendingRightGotoStart: this.pendingRightGotoStart, rightLinesLength: this.rightLines.length, rightScrollOffset: this.rightScrollOffset });
    this.activePane = result.activePane;
    this.pendingRightGotoStart = result.pendingRightGotoStart;
    this.rightScrollOffset = result.rightScrollOffset;
    if (result.close) this.closeHandler();
  }

  /** Clears child render caches. */
  override invalidate(): void { this.selectList.invalidate(); }

  /** Renders the selector through SharedModal. */
  override render(width: number): string[] { this.syncSharedModalState(width); return super.render(width); }

  /** Moves selection by delta. */
  protected moveSelection(delta: number): void { this.selectList.moveBy(delta); }

  /** Jumps selection to the next matching item. */
  protected jumpSelection(predicate: (item: AutocompleteItem) => boolean, direction: 1 | -1): void { this.selectList.jumpToMatch(predicate, direction); }

  /** Selects an item by value. */
  protected selectValue(value: string): void { this.selectList.selectValue(value); }

  /** Returns the current selected item. */
  protected getSelectedItem(): AutocompleteItem | null { return this.selectList.getSelectedItem(); }

  /** Focuses the preview pane. */
  protected focusRightPane(): void { if (this.showRightPane) this.activePane = "right"; this.pendingRightGotoStart = false; }

  /** Returns whether the preview pane is focused. */
  protected isRightPaneFocused(): boolean { return this.activePane === "right"; }

  /** Scrolls the right preview pane to the end. */
  protected scrollRightToEnd(): void { this.rightScrollOffset = Math.max(0, this.rightLines.length - Math.max(1, getTwoPaneBodyHeight(this.fullScreen))); this.pendingRightGotoStart = false; }

  /** Creates the select-list child. */
  private createList(items: AutocompleteItem[]): PlainSelectList { return createSelectList(this.uiTheme, this.listHeight, this.onPick, this.closeHandler, this.onSelectionChange, this.itemStyles, this.itemMaxLines, items); }

  /** Recomputes SharedModal header, panes, and footer. */
  private syncSharedModalState(width: number): void {
    const computedWidth = this.fullScreen ? width : computeModalWidth(width, this.modalMinWidth, this.modalMaxWidthRatio);
    const modalWidth = this.fullScreen ? width : this.modalMaxWidth === undefined ? computedWidth : Math.min(computedWidth, this.modalMaxWidth, width);
    const innerWidth = Math.max(1, modalWidth - 2);
    const footerHintRowCount = this.footerHintLines.length > 0 ? this.footerHintLines.length + 1 : 0;
    const bodyHeight = Math.max(1, getTwoPaneBodyHeight(this.fullScreen) - footerHintRowCount);
    const listHeight = this.bottomTitle ? bodyHeight - 2 : bodyHeight;
    this.resizeList(listHeight);
    const shells = createTwoPaneShells({ activePane: this.activePane, innerWidth, leftPaneMaxWidth: this.leftPaneMaxWidth, leftPaneRatio: this.leftPaneRatio, showLeftPane: this.showLeftPane, showRightPane: this.showRightPane });
    const widths = computeSharedPaneWidths(shells.map((shell) => ({ ...shell, lines: [] })), innerWidth);
    const right = createRightPaneLines(this.rightLines, bodyHeight, this.rightScrollOffset);
    this.rightScrollOffset = right.rightScrollOffset;
    const leftLines = this.selectList.render(widths[0] ?? innerWidth).slice(0, listHeight);
    while (leftLines.length < listHeight) leftLines.push("");
    this.headerLines = [createTwoPaneHeaderLine({ activePane: this.activePane, leftTitle: this.leftTitle, rightTitle: this.rightTitle, showFocusMarkers: this.showHeaderFocusMarkers, leftWidth: widths[0], rightWidth: widths.at(-1), showLeftPane: this.showLeftPane, showRightPane: this.showRightPane, uiTheme: this.uiTheme })];
    const footerSeparator = this.footerHintLines.length > 0 ? [SHARED_MODAL_FOOTER_BORDER] : [];
    this.footerLines = [...this.footerHintLines, ...footerSeparator, ...createTwoPaneFooterLine({ bottomPrefix: this.bottomPrefix, bottomTitle: this.bottomTitle, bottomValue: this.bottomValue })];
    this.panes = [...(this.showLeftPane ? [{ ...shells[0]!, lines: leftLines }] : []), ...(this.showRightPane ? [{ ...shells[shells.length - 1]!, lines: right.lines }] : [])];
  }

  /** Recreates the select list when visible height changes. */
  private resizeList(listHeight: number): void {
    if (this.listHeight === listHeight) return;
    const selectedValue = this.getSelectedItem()?.value;
    this.listHeight = listHeight;
    this.selectList = this.createList(this.items);
    if (selectedValue) this.selectList.selectValue(selectedValue);
  }
}
