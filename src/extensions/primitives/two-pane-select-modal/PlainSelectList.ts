import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { Key, matchesKey, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import type { ItemStyleFns, UITheme } from "./types.js";
import { wrapTextLines } from "./wrapTextLines.js";

/**
 * Minimal selectable list used inside the two-pane modal.
 */
export class PlainSelectList {
	private items: AutocompleteItem[] = [];
	private selectedIndex = 0;
	private pendingGotoStart = false;

	constructor(
		private readonly theme: UITheme,
		private readonly maxVisible: number,
		private readonly onPick: (item: AutocompleteItem) => void,
		private readonly onClose: () => void,
		private readonly onSelectionChange?: (item: AutocompleteItem | null) => void,
		private readonly styles?: ItemStyleFns,
		private readonly itemMaxLines?: (item: AutocompleteItem) => number,
	) {}

	/**
	 * Replaces the list items and resets selection.
	 *
	 * @param items Next list items.
	 */
	setItems(items: AutocompleteItem[]): void {
		this.items = items;
		this.selectedIndex = items.length > 0 ? 0 : -1;
		this.onSelectionChange?.(this.getSelectedItem());
	}

	/**
	 * Handles list navigation and selection keys.
	 *
	 * @param data Raw terminal input.
	 */
	handleInput(data: string): void {
		if (data === "G") {
			this.pendingGotoStart = false;
			if (this.items.length === 0) return;
			this.selectedIndex = this.items.length - 1;
			this.onSelectionChange?.(this.getSelectedItem());
			return;
		}
		if (data === "g") {
			if (this.pendingGotoStart) {
				this.pendingGotoStart = false;
				if (this.items.length === 0) return;
				this.selectedIndex = 0;
				this.onSelectionChange?.(this.getSelectedItem());
				return;
			}
			this.pendingGotoStart = true;
			return;
		}
		this.pendingGotoStart = false;
		if (matchesKey(data, Key.up) || matchesKey(data, Key.ctrl("p"))) {
			if (this.items.length === 0) return;
			this.selectedIndex = this.selectedIndex <= 0 ? this.items.length - 1 : this.selectedIndex - 1;
			this.onSelectionChange?.(this.getSelectedItem());
			return;
		}
		if (matchesKey(data, Key.down) || matchesKey(data, Key.ctrl("n"))) {
			if (this.items.length === 0) return;
			this.selectedIndex = this.selectedIndex >= this.items.length - 1 ? 0 : this.selectedIndex + 1;
			this.onSelectionChange?.(this.getSelectedItem());
			return;
		}
		if (matchesKey(data, Key.enter)) {
			const item = this.getSelectedItem();
			if (item) this.onPick(item);
			return;
		}
		if (matchesKey(data, Key.escape) || matchesKey(data, Key.ctrl("c"))) this.onClose();
	}

	/**
	 * Renders the visible list window.
	 *
	 * @param width Available list width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		if (this.items.length === 0) return [this.theme.fg("warning", "No matching commands")];
		const lines: string[] = [];
		const startIndex = Math.max(0, Math.min(this.selectedIndex - Math.floor(this.maxVisible / 2), this.items.length - this.maxVisible));
		const endIndex = Math.min(startIndex + this.maxVisible, this.items.length);
		for (let i = startIndex; i < endIndex; i += 1) {
			const item = this.items[i]!;
			const selected = i === this.selectedIndex;
			const rawLabel = item.label || item.value;
			const description = item.description?.replace(/[\r\n]+/g, " ").trim();
			const maxLines = Math.max(1, this.itemMaxLines?.(item) ?? 1);
			if (description) {
				const maxDescriptionWidth = Math.max(4, Math.min(18, Math.floor(width * 0.4)));
				const descText = truncateToWidth(description, maxDescriptionWidth, "");
				const remainingWidth = Math.max(1, width - 1 - visibleWidth(descText) - 1);
				const labelLines = wrapTextLines(rawLabel, remainingWidth, maxLines);
				const firstLabel = labelLines.shift() || "";
				const styledFirstLabel = this.styles?.label
					? this.styles.label(item, selected, firstLabel, this.theme)
					: selected
						? this.theme.fg("accent", this.theme.bold(firstLabel))
						: firstLabel;
				const styledDesc = this.styles?.description
					? this.styles.description(item, selected, descText, this.theme)
					: this.theme.fg("muted", descText);
				const spacing = " ".repeat(Math.max(1, width - 1 - visibleWidth(firstLabel) - visibleWidth(descText)));
				lines.push(` ${styledFirstLabel}${spacing}${styledDesc}`);
				for (const labelLine of labelLines) {
					const styledLine = this.styles?.label
						? this.styles.label(item, selected, labelLine, this.theme)
						: selected
							? this.theme.fg("accent", this.theme.bold(labelLine))
							: labelLine;
					lines.push(` ${styledLine}`);
				}
				continue;
			}
			const labelLines = wrapTextLines(rawLabel, Math.max(1, width - 3), maxLines);
			for (const labelLine of labelLines) {
				const styledLabel = this.styles?.label
					? this.styles.label(item, selected, labelLine, this.theme)
					: selected
						? this.theme.fg("accent", this.theme.bold(labelLine))
						: labelLine;
				lines.push(` ${styledLabel}`);
			}
		}
		if (startIndex > 0 || endIndex < this.items.length) {
			lines.push(this.theme.fg("dim", truncateToWidth(`(${Math.max(this.selectedIndex + 1, 0)}/${this.items.length})`, width, "")));
		}
		return lines;
	}

	/**
	 * Moves the current selection by the provided delta.
	 *
	 * @param delta Relative selection movement.
	 */
	moveBy(delta: number): void {
		if (this.items.length === 0 || delta === 0) return;
		const nextIndex = (((this.selectedIndex + delta) % this.items.length) + this.items.length) % this.items.length;
		this.selectedIndex = nextIndex;
		this.onSelectionChange?.(this.getSelectedItem());
	}

	/**
	 * Moves the selection to the first item.
	 */
	goToFirst(): void {
		if (this.items.length === 0) return;
		this.selectedIndex = 0;
		this.onSelectionChange?.(this.getSelectedItem());
	}

	/**
	 * Moves the selection to the last item.
	 */
	goToLast(): void {
		if (this.items.length === 0) return;
		this.selectedIndex = this.items.length - 1;
		this.onSelectionChange?.(this.getSelectedItem());
	}

	/**
	 * Jumps to the next matching item in the requested direction.
	 *
	 * @param predicate Match predicate.
	 * @param direction Search direction.
	 */
	jumpToMatch(predicate: (item: AutocompleteItem) => boolean, direction: 1 | -1): void {
		if (this.items.length === 0) return;
		for (let offset = 1; offset <= this.items.length; offset += 1) {
			const index = (((this.selectedIndex + offset * direction) % this.items.length) + this.items.length) % this.items.length;
			const item = this.items[index];
			if (!item || !predicate(item)) continue;
			this.selectedIndex = index;
			this.onSelectionChange?.(this.getSelectedItem());
			return;
		}
	}

	/**
	 * Selects the first item with the provided value.
	 *
	 * @param value Item value to select.
	 */
	selectValue(value: string): void {
		const index = this.items.findIndex((item) => item.value === value);
		if (index < 0) return;
		this.selectedIndex = index;
		this.onSelectionChange?.(this.getSelectedItem());
	}

	/**
	 * Invalidates cached list state.
	 */
	invalidate(): void {}

	/**
	 * Returns the currently selected item.
	 *
	 * @returns Selected item or null.
	 */
	getSelectedItem(): AutocompleteItem | null {
		return this.items[this.selectedIndex] ?? null;
	}
}
