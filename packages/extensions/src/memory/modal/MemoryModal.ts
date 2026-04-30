import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { Key, matchesKey } from "@mariozechner/pi-tui";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";
import type { MemoryItem } from "../types/MemoryItem.js";
import type { MemoryTreeItem } from "../types/MemoryTreeItem.js";
import { createMemoryFileTreeItems } from "./createMemoryFileTreeItems.js";
import { createMemoryTreeModalItems } from "./createMemoryTreeModalItems.js";
import { filterMemoryTreeItems } from "./filterMemoryTreeItems.js";
import { isMemoryFilterTextInput } from "./isMemoryFilterTextInput.js";

/**
 * Full-screen two-pane modal for browsing Nexus memory markdown.
 */
export class MemoryModal extends SelectPreviewModal {
	private filterQuery = "";
	private memoryItems: MemoryItem[];
	private searchActive = false;
	private treeRows: MemoryTreeItem[];

	constructor(theme: ExtensionCommandContext["ui"]["theme"], items: MemoryItem[], done: (result: undefined) => void, private readonly onDelete: (item: MemoryItem) => Promise<void>) {
		super(theme, () => undefined, () => done(undefined), undefined, { fullScreen: true, leftTitle: "Memory", rightTitle: "Markdown", leftPaneRatio: 0.38, bottomTitle: "Keys" });
		this.memoryItems = items;
		this.treeRows = createMemoryFileTreeItems(items);
		this.setOnSelectionChange((item) => this.setRightLines(this.getPreviewLines(item?.value)));
		this.refreshItems();
	}

	/** Handles search, delete, and list navigation input. */
	override handleInput(data: string): void {
		if (data === "/" && !this.searchActive) return this.startSearch();
		if (data === "d" && !this.searchActive) return void this.deleteSelected();
		if (this.handleSearchInput(data)) return;
		if (data === "h" || data === "k") return this.moveSelection(-1);
		if (data === "j" || data === "l") return this.moveSelection(1);
		super.handleInput(data);
	}

	/** Starts slash search mode. */
	private startSearch(): void {
		this.searchActive = true;
		this.refreshBottom();
	}

	/** Deletes the selected file row and commits the operation. */
	private deleteSelected(): void {
		const row = this.treeRows.find((candidate) => candidate.path === this.getSelectedItem()?.value);
		if (!row?.item) return;
		const deletedItem = row.item;
		this.memoryItems = this.memoryItems.filter((item) => item.path !== deletedItem.path);
		this.treeRows = createMemoryFileTreeItems(this.memoryItems);
		this.refreshItems();
		void this.onDelete(deletedItem).catch(() => undefined);
	}

	/** Updates search state from slash-mode input. */
	private handleSearchInput(data: string): boolean {
		if (!this.searchActive) return false;
		if (matchesKey(data, Key.escape)) {
			this.searchActive = false;
			this.filterQuery = "";
			this.refreshItems();
			return true;
		}
		if (data === "\u007f" || matchesKey(data, Key.backspace)) this.filterQuery = this.filterQuery.slice(0, -1);
		else if (isMemoryFilterTextInput(data)) this.filterQuery = `${this.filterQuery}${data}`;
		else return false;
		this.refreshItems();
		return true;
	}

	/** Refreshes list items and footer from the active filter. */
	private refreshItems(): void {
		const visible = filterMemoryTreeItems(this.treeRows, this.filterQuery);
		this.setItems(createMemoryTreeModalItems(visible));
		this.refreshBottom();
		this.setRightLines(this.getPreviewLines(visible[0]?.path));
	}

	/** Refreshes the footer with current mode hints. */
	private refreshBottom(): void {
		const value = this.searchActive ? `/${this.filterQuery}` : "j/k/h/l or arrows move · / search · d delete · esc close";
		this.setBottom(this.searchActive ? "Search" : "Keys", value, this.searchActive ? "" : "");
	}

	/** Reads preview lines for a selected tree row path. */
	private getPreviewLines(path: string | undefined): string[] {
		const row = this.treeRows.find((item) => item.path === path);
		return row?.item ? [row.item.path, "", ...row.item.content.split(/\r?\n/)] : ["No memory item selected"];
	}
}
