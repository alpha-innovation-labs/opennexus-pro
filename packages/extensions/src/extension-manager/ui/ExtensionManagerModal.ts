import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { Key, matchesKey } from "@mariozechner/pi-tui";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";
import { updateManagedExtensionRows } from "../model/updateManagedExtensionRows.js";
import type { ExtensionManagerTab, ManagedExtensionRow } from "../model/types.js";
import { createExtensionManagerHeader } from "./createExtensionManagerHeader.js";
import { createManagedExtensionItems } from "./createManagedExtensionItems.js";
import { filterManagedExtensionRows } from "./filterManagedExtensionRows.js";
import { getExtensionManagerHeaderWidth } from "./getExtensionManagerHeaderWidth.js";
import { getNextExtensionManagerTab } from "./getNextExtensionManagerTab.js";
import { isExtensionManagerTextInput } from "./isExtensionManagerTextInput.js";

export type ExtensionManagerUpdate = (extensionId: string, enabled: boolean) => ManagedExtensionRow[];

/**
 * Modal that lists installed extensions and toggles user enablement.
 */
export class ExtensionManagerModal extends SelectPreviewModal {
	private activeTab: ExtensionManagerTab = "all";
	private filterQuery = "";
	private rows: ManagedExtensionRow[];

	/**
	 * Creates the extension manager modal.
	 *
	 * @param theme Active UI theme.
	 * @param rows Installed extension rows.
	 * @param done Completion callback.
	 * @param onUpdate Optional persistence callback.
	 */
	constructor(
		private readonly rowTheme: ExtensionCommandContext["ui"]["theme"],
		rows: ManagedExtensionRow[],
		done: (result: undefined) => void,
		private readonly onUpdate?: ExtensionManagerUpdate,
		private readonly title = "Extensions",
	) {
		super(rowTheme, () => undefined, () => done(undefined), undefined, { leftTitle: title, showRightPane: false });
		this.rows = rows;
		this.setHeaderFocusMarkers(false);
		this.setOnPick(() => this.toggleSelectedExtension());
		this.refreshBottom();
		this.refreshItems();
	}

	/**
	 * Handles tab, search, and toggle input.
	 *
	 * @param data Raw keyboard input.
	 */
	override handleInput(data: string): void {
		if (matchesKey(data, Key.shift("tab"))) return this.moveToNextTab(-1);
		if (matchesKey(data, Key.tab)) return this.moveToNextTab(1);
		if (matchesKey(data, Key.enter) || data === " ") return this.toggleSelectedExtension();
		if (this.clearFilterOnEscape(data)) return;
		if (this.handleFilterInput(data)) return;
		super.handleInput(data);
	}

	/**
	 * Renders the modal with top-right scope tabs.
	 *
	 * @param width Available terminal width.
	 * @returns Rendered modal lines.
	 */
	override render(width: number): string[] {
		this.setTitles(createExtensionManagerHeader(this.title, this.activeTab, getExtensionManagerHeaderWidth(width), this.rowTheme), "");
		return super.render(width);
	}

	/**
	 * Moves between All, Core, and User tabs.
	 *
	 * @param direction Tab traversal direction.
	 */
	private moveToNextTab(direction: 1 | -1): void {
		this.activeTab = getNextExtensionManagerTab(this.activeTab, direction);
		this.refreshItems();
	}

	/**
	 * Toggles the selected extension enabled state.
	 */
	private toggleSelectedExtension(): void {
		const item = this.getSelectedItem();
		const row = this.rows.find((candidate) => candidate.id === item?.value);
		if (!row) return;
		const enabled = row.status !== "enabled";
		this.rows = this.onUpdate?.(row.id, enabled) ?? updateManagedExtensionRows(this.rows, row.id, enabled ? "enabled" : "disabled");
		this.refreshItems(row.id);
	}

	/**
	 * Clears the search filter before escape closes the modal.
	 *
	 * @param data Raw keyboard input.
	 * @returns True when the filter was cleared.
	 */
	private clearFilterOnEscape(data: string): boolean {
		if (!matchesKey(data, Key.escape) || this.filterQuery.length === 0) return false;
		this.filterQuery = "";
		this.refreshBottom();
		this.refreshItems();
		return true;
	}

	/**
	 * Applies text search input.
	 *
	 * @param data Raw keyboard input.
	 * @returns True when input changed the search query.
	 */
	private handleFilterInput(data: string): boolean {
		if (data === "\u007f" || matchesKey(data, Key.backspace)) this.filterQuery = this.filterQuery.slice(0, -1);
		else if (isExtensionManagerTextInput(data)) this.filterQuery = `${this.filterQuery}${data}`;
		else return false;
		this.refreshBottom();
		this.refreshItems();
		return true;
	}

	/**
	 * Rebuilds visible items while preserving selection.
	 *
	 * @param selectedValue Selected extension id to restore.
	 */
	private refreshItems(selectedValue = this.getSelectedItem()?.value): void {
		this.setItems(createManagedExtensionItems(filterManagedExtensionRows(this.rows, this.activeTab, this.filterQuery), this.rowTheme));
		if (selectedValue) this.selectValue(selectedValue);
	}

	/**
	 * Refreshes the search footer.
	 */
	private refreshBottom(): void {
		this.setBottom("Search", this.filterQuery, "> ");
	}
}
