import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { Key, matchesKey } from "@mariozechner/pi-tui";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";
import { updateManagedExtensionRows } from "../model/updateManagedExtensionRows.js";
import type { ExtensionManagerTab, ManagedExtensionRow } from "../model/types.js";
import type { ExtensionManagerCallbacks } from "./ExtensionManagerCallbacks.js";
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
	private searchRows: ManagedExtensionRow[] = [];
	private pendingAction: string | null = null;

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
		private readonly callbacksOrUpdate?: ExtensionManagerUpdate | ExtensionManagerCallbacks,
		private readonly title = "Extensions",
	) {
		super(rowTheme, () => undefined, () => done(undefined), undefined, { leftTitle: title, showRightPane: false });
		this.rows = rows;
		this.setHeaderFocusMarkers(false);
		this.setOnPick(() => void this.activateSelectedRow());
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
		if (data === "d") return void this.removeSelectedPackage();
		if (data === "u") return void this.updateSelectedPackage();
		if (matchesKey(data, Key.enter) || data === " ") return void this.activateSelectedRow();
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
		this.refreshBottom();
		this.refreshItems();
		void this.refreshSearchRows();
	}

	/**
	 * Toggles the selected extension enabled state.
	 */
	private async activateSelectedRow(): Promise<void> {
		const row = this.getSelectedRow();
		if (!row || this.pendingAction) return;
		if (row.rowType === "search") return this.installPackage(row);
		this.toggleSelectedExtension(row);
	}

	/**
	 * Toggles one extension enabled state.
	 *
	 * @param row Selected extension row.
	 */
	private toggleSelectedExtension(row: ManagedExtensionRow): void {
		const enabled = row.status !== "enabled";
		const update = typeof this.callbacksOrUpdate === "function" ? this.callbacksOrUpdate : this.callbacksOrUpdate?.onUpdate;
		this.rows = update?.(row.id, enabled) ?? updateManagedExtensionRows(this.rows, row.id, enabled ? "enabled" : "disabled");
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
		void this.refreshSearchRows();
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
		void this.refreshSearchRows();
		return true;
	}

	/**
	 * Rebuilds visible items while preserving selection.
	 *
	 * @param selectedValue Selected extension id to restore.
	 */
	private refreshItems(selectedValue = this.getSelectedItem()?.value): void {
		const rows = filterManagedExtensionRows([...this.rows, ...this.searchRows], this.activeTab, this.filterQuery);
		this.setItems(createManagedExtensionItems(rows, this.rowTheme));
		if (selectedValue) this.selectValue(selectedValue);
	}

	/**
	 * Refreshes the search footer.
	 */
	private refreshBottom(): void {
		const label = this.activeTab === "third-party" ? "Search/install" : "Search";
		const hint = this.pendingAction ?? (this.activeTab === "third-party" ? "Enter install/toggle · u update · d remove · type to search npm" : "Enter/Space toggle · Tab switch tabs");
		this.setFooterHintLines([this.rowTheme.fg("dim", hint)]);
		this.setBottom(label, this.filterQuery, "> ");
	}

	/** Refreshes async npm search rows for the third-party tab. */
	private async refreshSearchRows(): Promise<void> {
		const search = typeof this.callbacksOrUpdate === "function" ? undefined : this.callbacksOrUpdate?.onSearchPackages;
		if (this.activeTab !== "third-party" || !search) { this.searchRows = []; this.refreshItems(); return; }
		const query = this.filterQuery;
		try { this.searchRows = await search(query, this.rows); if (query === this.filterQuery) this.refreshItems(); }
		catch { this.searchRows = []; this.refreshItems(); }
	}

	/** Returns the currently selected row. */
	private getSelectedRow(): ManagedExtensionRow | undefined {
		const value = this.getSelectedItem()?.value;
		return [...this.rows, ...this.searchRows].find((row) => row.id === value);
	}

	/** Installs one selected npm package row. */
	private async installPackage(row: ManagedExtensionRow): Promise<void> {
		if (!row.source || typeof this.callbacksOrUpdate === "function" || !this.callbacksOrUpdate?.onInstallPackage) return;
		this.pendingAction = `Installing ${row.source}…`; this.refreshBottom();
		this.rows = await this.callbacksOrUpdate.onInstallPackage(row.source); this.searchRows = []; this.pendingAction = null; this.refreshBottom(); this.refreshItems(row.id);
	}

	/** Removes one configured package row from Nexus settings. */
	private async removeSelectedPackage(): Promise<void> {
		const row = this.getSelectedRow();
		if (row?.rowType !== "package" || !row.source || typeof this.callbacksOrUpdate === "function" || !this.callbacksOrUpdate?.onRemovePackage) return;
		this.pendingAction = `Removing ${row.source}…`; this.refreshBottom();
		this.rows = await this.callbacksOrUpdate.onRemovePackage(row.source); this.pendingAction = null; this.refreshBottom(); this.refreshItems();
	}

	/** Updates one configured package through Pi's package manager. */
	private async updateSelectedPackage(): Promise<void> {
		const row = this.getSelectedRow();
		if (row?.rowType !== "package" || !row.source || typeof this.callbacksOrUpdate === "function" || !this.callbacksOrUpdate?.onUpdatePackage) return;
		this.pendingAction = `Updating ${row.source}…`; this.refreshBottom();
		this.rows = await this.callbacksOrUpdate.onUpdatePackage(row.source); this.pendingAction = null; this.refreshBottom(); this.refreshItems(row.id);
	}
}
