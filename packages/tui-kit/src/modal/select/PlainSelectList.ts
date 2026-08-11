import type { AutocompleteItem } from "@earendil-works/pi-tui";
import { Key, matchesKey } from "@earendil-works/pi-tui";
import { renderSelectListLines } from "./renderSelectListLines";
import type { SelectPreviewItemStyleFns, SelectPreviewTheme } from "./types";

/** Minimal selectable list used inside shared select preview modals. */
export class PlainSelectList {
  private items: AutocompleteItem[] = [];
  private pendingGotoStart = false;
  private selectedIndex = 0;

  /** Creates a plain selectable list. */
  constructor(
    private readonly theme: SelectPreviewTheme,
    private readonly maxVisible: number,
    private readonly onPick: (item: AutocompleteItem) => void,
    private readonly onClose: () => void,
    private readonly onSelectionChange?: (item: AutocompleteItem | null) => void,
    private readonly styles?: SelectPreviewItemStyleFns,
    private readonly itemMaxLines?: (item: AutocompleteItem) => number,
  ) {}

  /** Replaces list items and resets selection. */
  setItems(items: AutocompleteItem[]): void {
    this.items = items;
    this.selectedIndex = items.length > 0 ? 0 : -1;
    this.emitSelection();
  }

  /** Handles list navigation and selection keys. */
  handleInput(data: string): void {
    if (data === "G") {
      this.goToLastViaInput();
      return;
    }
    if (data === "g") {
      this.handleGotoStart();
      return;
    }
    this.pendingGotoStart = false;
    if (data === "k" || matchesKey(data, Key.up) || matchesKey(data, Key.ctrl("p"))) {
      this.moveBy(-1);
      return;
    }
    if (data === "j" || matchesKey(data, Key.down) || matchesKey(data, Key.ctrl("n"))) {
      this.moveBy(1);
      return;
    }
    if (matchesKey(data, Key.enter)) {
      this.pickSelected();
      return;
    }
    if (matchesKey(data, Key.escape) || matchesKey(data, Key.ctrl("c"))) this.onClose();
  }

  /** Renders the visible list window. */
  render(width: number): string[] {
    return renderSelectListLines({ itemMaxLines: this.itemMaxLines, items: this.items, maxVisible: this.maxVisible, selectedIndex: this.selectedIndex, styles: this.styles, theme: this.theme, width });
  }

  /** Moves the current selection by the provided delta. */
  moveBy(delta: number): void {
    if (this.items.length === 0 || delta === 0) return;
    this.selectedIndex = (((this.selectedIndex + delta) % this.items.length) + this.items.length) % this.items.length;
    this.emitSelection();
  }

  /** Jumps to the next matching item in the requested direction. */
  jumpToMatch(predicate: (item: AutocompleteItem) => boolean, direction: 1 | -1): void {
    if (this.items.length === 0) return;
    for (let offset = 1; offset <= this.items.length; offset += 1) {
      const index = (((this.selectedIndex + offset * direction) % this.items.length) + this.items.length) % this.items.length;
      const item = this.items[index];
      if (!item || !predicate(item)) continue;
      this.selectedIndex = index;
      this.emitSelection();
      return;
    }
  }

  /** Selects the first item with the provided value. */
  selectValue(value: string): void {
    const index = this.items.findIndex((item) => item.value === value);
    if (index < 0) return;
    this.selectedIndex = index;
    this.emitSelection();
  }

  /** Invalidates cached list state. */
  invalidate(): void {}

  /** Returns the current selected item. */
  getSelectedItem(): AutocompleteItem | null {
    return this.items[this.selectedIndex] ?? null;
  }

  /** Emits the current selected item. */
  private emitSelection(): void {
    this.onSelectionChange?.(this.getSelectedItem());
  }

  /** Handles jump-to-start input. */
  private handleGotoStart(): void {
    if (!this.pendingGotoStart) {
      this.pendingGotoStart = true;
      return;
    }
    this.pendingGotoStart = false;
    if (this.items.length === 0) return;
    this.selectedIndex = 0;
    this.emitSelection();
  }

  /** Moves to the last item via input. */
  private goToLastViaInput(): void {
    this.pendingGotoStart = false;
    if (this.items.length === 0) return;
    this.selectedIndex = this.items.length - 1;
    this.emitSelection();
  }

  /** Picks the currently selected item. */
  private pickSelected(): void {
    const item = this.getSelectedItem();
    if (item) this.onPick(item);
  }
}
