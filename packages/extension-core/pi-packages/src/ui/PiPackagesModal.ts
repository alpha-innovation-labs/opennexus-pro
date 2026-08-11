import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { Key, matchesKey } from "@earendil-works/pi-tui";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index";
import { updateManagedExtensionRows } from "../model/updateManagedExtensionRows";
import type { PiPackagesTab, ManagedExtensionRow } from "../model/types";
import type { PiPackagesCallbacks } from "./PiPackagesCallbacks";
import { createPiPackagesHeader } from "./createPiPackagesHeader";
import { createManagedExtensionItems } from "./createManagedExtensionItems";
import { filterManagedExtensionRows } from "./filterManagedExtensionRows";
import { getPiPackagesHeaderWidth } from "./getPiPackagesHeaderWidth";
import { getNextPiPackagesTab } from "./getNextPiPackagesTab";
import { isPiPackagesTextInput } from "./isPiPackagesTextInput";

export type PiPackagesUpdate = (extensionId: string, enabled: boolean) => ManagedExtensionRow[];

/** Modal that lists installed Pi packages and toggles user enablement. */
export class PiPackagesModal extends SelectPreviewModal {
	private activeTab: PiPackagesTab = "third-party";
	private filterQuery = "";
	private rows: ManagedExtensionRow[];
	private searchActive = false;
	private searchRows: ManagedExtensionRow[] = [];
	private pendingAction: string | null = null;

	/** Creates the Pi packages modal. */
	constructor(
		private readonly rowTheme: ExtensionCommandContext["ui"]["theme"],
		rows: ManagedExtensionRow[],
		done: (result: undefined) => void,
		private readonly callbacksOrUpdate?: PiPackagesUpdate | PiPackagesCallbacks,
		private readonly title = "Pi Packages",
		initialTab: PiPackagesTab = "third-party",
	) {
		super(rowTheme, () => undefined, () => done(undefined), undefined, { leftTitle: title, showRightPane: false });
		this.activeTab = initialTab;
		this.rows = rows;
		this.setHeaderFocusMarkers(false);
		this.setOnPick(() => void this.activateSelectedRow());
		this.refreshBottom();
		this.refreshItems();
	}

	/** Handles tab, search-mode, update/remove, and selection input. */
	override handleInput(data: string): void {
		if (matchesKey(data, Key.shift("tab"))) { this.moveToNextTab(-1); return; }
		if (matchesKey(data, Key.tab)) { this.moveToNextTab(1); return; }
		if (this.searchActive && this.closeSearchOnEscape(data)) return;
		if (this.searchActive && this.handleFilterInput(data)) return;
		if (data === "/") { this.openSearch(); return; }
		if (data === "d") { void this.removeSelectedPackage(); return; }
		if (data === "u") { void this.updateSelectedPackage(); return; }
		if (matchesKey(data, Key.enter) || data === " ") { void this.activateSelectedRow(); return; }
		super.handleInput(data);
	}

	/** Renders the modal with top-right scope tabs. */
	override render(width: number): string[] {
		this.setTitles(createPiPackagesHeader(this.title, this.activeTab, getPiPackagesHeaderWidth(width), this.rowTheme), "");
		return super.render(width);
	}

	/** Moves between All and Third-party tabs. */
	private moveToNextTab(direction: 1 | -1): void {
		this.activeTab = getNextPiPackagesTab(this.activeTab, direction);
		this.refreshBottom();
		this.refreshItems();
		void this.refreshSearchRows();
	}

	/** Starts explicit slash search mode. */
	private openSearch(): void {
		this.searchActive = true;
		this.refreshBottom();
		this.refreshItems();
		void this.refreshSearchRows();
	}

	/** Toggles or installs the selected row. */
	private async activateSelectedRow(): Promise<void> {
		const row = this.getSelectedRow();
		if (!row || this.pendingAction) return;
		if (row.rowType === "search") return this.installPackage(row);
		this.toggleSelectedExtension(row);
	}

	/** Toggles one extension enabled state. */
	private toggleSelectedExtension(row: ManagedExtensionRow): void {
		const enabled = row.status !== "enabled";
		const update = typeof this.callbacksOrUpdate === "function" ? this.callbacksOrUpdate : this.callbacksOrUpdate?.onUpdate;
		this.rows = update?.(row.id, enabled) ?? updateManagedExtensionRows(this.rows, row.id, enabled ? "enabled" : "disabled");
		this.refreshItems(row.id);
	}

	/** Clears slash search mode when Escape is pressed. */
	private closeSearchOnEscape(data: string): boolean {
		if (!matchesKey(data, Key.escape)) return false;
		this.searchActive = false;
		this.filterQuery = "";
		this.searchRows = [];
		this.refreshBottom();
		this.refreshItems();
		return true;
	}

	/** Applies text input while slash search mode is active. */
	private handleFilterInput(data: string): boolean {
		if (data === "\u007f" || matchesKey(data, Key.backspace)) this.filterQuery = this.filterQuery.slice(0, -1);
		else if (isPiPackagesTextInput(data)) this.filterQuery = `${this.filterQuery}${data}`;
		else return false;
		this.refreshBottom();
		this.refreshItems();
		void this.refreshSearchRows();
		return true;
	}

	/** Rebuilds visible items while preserving selection when still visible. */
	private refreshItems(selectedValue = this.getSelectedItem()?.value): void {
		const sourceRows = this.searchActive && this.searchRows.length > 0 ? [...this.searchRows, ...this.rows] : [...this.rows, ...this.searchRows];
		const rows = filterManagedExtensionRows(sourceRows, this.activeTab, this.filterQuery);
		this.setItems(createManagedExtensionItems(rows, this.rowTheme));
		if (selectedValue && !this.searchActive) this.selectValue(selectedValue);
	}

	/** Refreshes the search footer. */
	private refreshBottom(): void {
		const label = this.searchActive ? (this.activeTab === "third-party" ? "Search/install" : "Search") : "Search";
		const inactiveHint = this.activeTab === "third-party" ? "Enter install/toggle · u update · d remove · / search npm" : "Enter/Space toggle · Tab switch tabs · / search";
		const activeHint = this.activeTab === "third-party" ? "Type npm query · Enter install/toggle · Esc clear" : "Type to filter · Esc clear";
		this.setFooterHintLines([this.rowTheme.fg("dim", this.pendingAction ?? (this.searchActive ? activeHint : inactiveHint))]);
		this.setBottom(label, this.searchActive ? this.filterQuery : "", this.searchActive ? "> " : "/ ");
	}

	/** Refreshes async npm search rows for the third-party tab. */
	private async refreshSearchRows(): Promise<void> {
		const search = typeof this.callbacksOrUpdate === "function" ? undefined : this.callbacksOrUpdate?.onSearchPackages;
		if (!this.searchActive || this.activeTab !== "third-party" || !search) { this.searchRows = []; this.refreshItems(); return; }
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
		this.rows = await this.callbacksOrUpdate.onInstallPackage(row.source); this.searchRows = []; this.searchActive = false; this.filterQuery = ""; this.pendingAction = null; this.refreshBottom(); this.refreshItems(row.id);
	}

	/** Removes one selected third-party extension or package from Nexus settings. */
	private async removeSelectedPackage(): Promise<void> {
		const row = this.getSelectedRow();
		if (row?.kind !== "third-party" || row.rowType === "search" || typeof this.callbacksOrUpdate === "function" || !this.callbacksOrUpdate?.onRemovePackage) return;
		const source = row.rowType === "package" && row.source ? row.source : row.id;
		this.pendingAction = `Removing ${source}…`; this.refreshBottom();
		this.rows = await this.callbacksOrUpdate.onRemovePackage(source); this.pendingAction = null; this.refreshBottom(); this.refreshItems();
	}

	/** Updates one configured package through Pi's package manager. */
	private async updateSelectedPackage(): Promise<void> {
		const row = this.getSelectedRow();
		if (row?.rowType !== "package" || !row.source || typeof this.callbacksOrUpdate === "function" || !this.callbacksOrUpdate?.onUpdatePackage) return;
		this.pendingAction = `Updating ${row.source}…`; this.refreshBottom();
		this.rows = await this.callbacksOrUpdate.onUpdatePackage(row.source); this.pendingAction = null; this.refreshBottom(); this.refreshItems(row.id);
	}
}
