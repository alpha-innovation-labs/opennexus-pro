import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { TwoPaneSelectModal } from "../../shared/two-pane-select-modal/index.js";
import type { FeatureStatusRow } from "../model/types.js";
import { buildFeatureDetailLines } from "./buildFeatureDetailLines.js";
import { createFeatureAutocompleteItems } from "./createFeatureAutocompleteItems.js";
import { getFeatureStatusRowForItem } from "./getFeatureStatusRowForItem.js";

/**
 * Two-pane modal for browsing feature flags and release channels.
 */
export class FeatureManagementModal extends TwoPaneSelectModal {
	private readonly rows: FeatureStatusRow[];

	constructor(
		theme: ExtensionCommandContext["ui"]["theme"],
		rows: FeatureStatusRow[],
		done: (result: undefined) => void,
	) {
		super(theme, () => done(undefined), () => done(undefined), undefined, {
			leftTitle: "Features",
			rightTitle: "Status",
			leftPaneRatio: 0.55,
		});
		this.rows = rows;
		this.setOnSelectionChange((item) => {
			this.setRightLines(buildFeatureDetailLines(getFeatureStatusRowForItem(this.rows, item)));
		});
		this.setItems(createFeatureAutocompleteItems(rows));
		this.setRightLines(buildFeatureDetailLines(rows[0] ?? null));
	}
}
