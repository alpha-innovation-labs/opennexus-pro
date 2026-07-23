import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { Key, matchesKey } from "@earendil-works/pi-tui";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";
import type { FeatureFlagConfigPatch } from "../model/updateFeatureFlagsConfig.js";
import type { FeatureRuntimeStatus, FeatureStatusRow } from "../model/types.js";
import { createFeatureAutocompleteItems } from "./createFeatureAutocompleteItems.js";
import { getFeatureStatusRowForItem } from "./getFeatureStatusRowForItem.js";

export type FeatureManagementUpdate = (
	extensionId: string,
	patch: FeatureFlagConfigPatch,
	row: FeatureStatusRow,
) => FeatureStatusRow[];

/**
 * Simplified feature-management modal: a single scrollable list of all
 * extensions and mini-apps with their enabled/disabled status.
 * Press Enter to toggle. Search with the filter bar.
 */
export class FeatureManagementModal extends SelectPreviewModal {
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
		this.setOnPick(() => this.toggleSelected());
		this.refreshBottom();
		this.refreshItems();
	}

	/**
	 * Routes keyboard input for filter and toggles.
	 *
	 * @param data Raw keyboard input.
	 */
	override handleInput(data: string): void {
		if (matchesKey(data, Key.enter)) {
			this.toggleSelected();
			return;
		}
		if (this.clearFilterOnEscape(data)) return;
		if (this.handleFilterInput(data)) return;
		super.handleInput(data);
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
			this.refreshItems();
			return true;
		}
		if (!data.match(/[a-z0-9_-]/i)) return false;
		this.filterQuery = `${this.filterQuery}${data}`;
		this.refreshItems();
		return true;
	}

	/**
	 * Toggles the status of the currently focused row.
	 */
	private toggleSelected(): void {
		const selected = this.getSelectedItem();
		const row = getFeatureStatusRowForItem(this.rows, selected);
		if (!row) return;

		const patch: FeatureFlagConfigPatch = {
			status: row.status === "enabled" ? "disabled" : "enabled",
		};
		this.rows = this.onUpdate?.(row.extensionId, patch, row) ?? this.applyLocalPatch(row.extensionId, patch, row);
		this.refreshItems(row.extensionId);
	}

	/**
	 * Applies a row patch without persistence (fallback for tests).
	 *
	 * @param extensionId Feature id to update.
	 * @param patch Patch describing the change.
	 * @param targetRow Existing row being updated.
	 * @returns Updated rows.
	 */
	private applyLocalPatch(extensionId: string, patch: FeatureFlagConfigPatch, targetRow: FeatureStatusRow): FeatureStatusRow[] {
		return this.rows.map((row) =>
			row.extensionId === extensionId ? { ...row, status: (patch.status ?? row.status) as FeatureRuntimeStatus } : row,
		);
	}

	/**
	 * Rebuilds modal items while preserving the current row selection.
	 *
	 * @param selectedValue Selected feature id to restore.
	 */
	private refreshItems(selectedValue = this.getSelectedItem()?.value): void {
		const visibleRows = this.filterQuery
			? this.rows.filter((row) => row.feature.toLowerCase().includes(this.filterQuery.trim().toLowerCase()))
			: this.rows;
		this.setItems(createFeatureAutocompleteItems(visibleRows, this.rowTheme));
		if (selectedValue) this.selectValue(selectedValue);
	}

	/**
	 * Refreshes the footer search prompt.
	 */
	private refreshBottom(): void {
		this.setBottom("Search", this.filterQuery, "> ");
	}

	/**
	 * Renders the modal with title on the left.
	 *
	 * @param width Available terminal width.
	 * @returns Rendered modal lines.
	 */
	override render(width: number): string[] {
		this.setTitles("Features", "");
		return super.render(width);
	}
}
