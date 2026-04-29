import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { Key, matchesKey } from "@mariozechner/pi-tui";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";
import type { FeatureFlagConfigPatch } from "../model/updateFeatureFlagsConfig.js";
import type { FeatureManagementControl, FeatureManagementTab, FeatureStatusRow } from "../model/types.js";
import { createFeatureAutocompleteItems } from "./createFeatureAutocompleteItems.js";
import { createFeatureManagementHeader } from "./createFeatureManagementHeader.js";
import { filterFeatureStatusRows } from "./filterFeatureStatusRows.js";
import { filterFeatureStatusRowsByTab } from "./filterFeatureStatusRowsByTab.js";
import { getFeatureManagementHeaderWidth } from "./getFeatureManagementHeaderWidth.js";
import { getFeatureStatusRowForItem } from "./getFeatureStatusRowForItem.js";
import { getNextFeatureManagementTab } from "./getNextFeatureManagementTab.js";
import { isFeatureFilterTextInput } from "./isFeatureFilterTextInput.js";

export type FeatureManagementUpdate = (
	extensionId: string,
	patch: FeatureFlagConfigPatch,
	row: FeatureStatusRow,
) => FeatureStatusRow[];

/**
 * Single-pane modal for browsing and editing extension and non-extension feature flags.
 */
export class FeatureManagementModal extends SelectPreviewModal {
	private activeControl: FeatureManagementControl = "status";
	private activeTab: FeatureManagementTab = "all";
	private filterQuery = "";
	private readonly rowTheme: ExtensionCommandContext["ui"]["theme"];
	private rows: FeatureStatusRow[];

	/**
	 * Creates the feature-management modal.
	 *
	 * @param theme Active UI theme.
	 * @param rows Feature status rows to display.
	 * @param done Completion callback.
	 * @param onUpdate Optional update callback used to persist edits.
	 */
	constructor(
		theme: ExtensionCommandContext["ui"]["theme"],
		rows: FeatureStatusRow[],
		done: (result: undefined) => void,
		private readonly onUpdate?: FeatureManagementUpdate,
	) {
		super(theme, () => undefined, () => done(undefined), undefined, {
			leftTitle: "Features",
			showRightPane: false,
		});
		this.rows = rows;
		this.rowTheme = theme;
		this.setHeaderFocusMarkers(false);
		this.setOnPick(() => this.toggleSelectedControl());
		this.refreshBottom();
		this.refreshItems();
	}

	/**
	 * Routes keyboard input for tab navigation, field focus, and row toggles.
	 *
	 * @param data Raw keyboard input.
	 */
	override handleInput(data: string): void {
		if (matchesKey(data, Key.shift("tab"))) {
			this.moveToNextTab(-1);
			return;
		}
		if (matchesKey(data, Key.tab)) {
			this.moveToNextTab(1);
			return;
		}
		if (matchesKey(data, Key.enter)) {
			this.toggleSelectedControl();
			return;
		}
		if (data === " " || matchesKey(data, Key.right)) {
			this.moveToNextControl();
			return;
		}
		if (this.clearFilterOnEscape(data)) return;
		if (this.handleFilterInput(data)) return;
		super.handleInput(data);
	}

	/**
	 * Switches focus between status and channel controls.
	 */
	private moveToNextControl(): void {
		this.activeControl = this.activeControl === "status" ? "channel" : "status";
		this.refreshItems(this.getSelectedItem()?.value);
	}

	/**
	 * Switches the active feature category tab.
	 *
	 * @param direction Tab traversal direction.
	 */
	private moveToNextTab(direction: 1 | -1): void {
		this.activeTab = getNextFeatureManagementTab(this.activeTab, direction);
		this.refreshBottom();
		this.refreshItems();
	}

	/**
	 * Clears the active filter when escape is pressed.
	 *
	 * @param data Raw keyboard input.
	 * @returns True when escape cleared a filter instead of closing.
	 */
	private clearFilterOnEscape(data: string): boolean {
		if (!matchesKey(data, Key.escape) || this.filterQuery.length === 0) return false;
		this.filterQuery = "";
		this.refreshBottom();
		this.refreshItems();
		return true;
	}

	/**
	 * Updates the filter query for printable text and backspace input.
	 *
	 * @param data Raw keyboard input.
	 * @returns True when filter input was handled.
	 */
	private handleFilterInput(data: string): boolean {
		if (data === "\u007f" || matchesKey(data, Key.backspace)) {
			this.filterQuery = this.filterQuery.slice(0, -1);
			this.refreshBottom();
			this.refreshItems();
			return true;
		}
		if (!isFeatureFilterTextInput(data)) return false;
		this.filterQuery = `${this.filterQuery}${data}`;
		this.refreshBottom();
		this.refreshItems();
		return true;
	}

	/**
	 * Toggles the currently focused control for the selected row.
	 */
	private toggleSelectedControl(): void {
		const selected = this.getSelectedItem();
		const row = getFeatureStatusRowForItem(this.rows, selected);
		if (!row) return;

		const patch = this.createPatch(row);
		this.rows = this.onUpdate?.(row.extensionId, patch, row) ?? this.applyLocalPatch(row.extensionId, patch, row);
		this.refreshItems(row.extensionId);
	}

	/**
	 * Creates a config patch for the active control.
	 *
	 * @param row Selected feature row.
	 * @returns Patch that flips the focused control.
	 */
	private createPatch(row: FeatureStatusRow): FeatureFlagConfigPatch {
		if (this.activeControl === "status") return { status: row.status === "enabled" ? "disabled" : "enabled" };
		return { channel: row.channel === "production" ? "dev" : "production" };
	}

	/**
	 * Applies a row patch without persistence for tests and read-only callers.
	 *
	 * @param extensionId Feature id to update.
	 * @param patch Status or channel change.
	 * @param targetRow Existing row being updated.
	 * @returns Updated rows.
	 */
	private applyLocalPatch(extensionId: string, patch: FeatureFlagConfigPatch, targetRow: FeatureStatusRow): FeatureStatusRow[] {
		return this.rows.map((row) => (row.extensionId === extensionId && row.category === targetRow.category ? { ...row, ...patch } : row));
	}

	/**
	 * Rebuilds modal items while preserving the current row selection.
	 *
	 * @param selectedValue Selected feature id to restore.
	 */
	private refreshItems(selectedValue = this.getSelectedItem()?.value): void {
		const tabRows = filterFeatureStatusRowsByTab(this.rows, this.activeTab);
		const visibleRows = filterFeatureStatusRows(tabRows, this.filterQuery);
		this.setItems(createFeatureAutocompleteItems(visibleRows, this.activeControl, this.rowTheme));
		if (selectedValue) this.selectValue(selectedValue);
	}

	/**
	 * Refreshes the footer search prompt.
	 */
	private refreshBottom(): void {
		this.setBottom("Search", this.filterQuery, "> ");
	}

	/**
	 * Renders the modal with top-right feature category tabs.
	 *
	 * @param width Available terminal width.
	 * @returns Rendered modal lines.
	 */
	override render(width: number): string[] {
		this.setTitles(createFeatureManagementHeader("Features", this.activeTab, getFeatureManagementHeaderWidth(width), this.rowTheme), "");
		return super.render(width);
	}
}
