import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";

/**
 * Two-pane modal for browsing observation topics and details.
 */
export class ObservationsModal extends SelectPreviewModal {
	private readonly detailsByValue: Map<string, string[]>;

	constructor(
		theme: ExtensionCommandContext["ui"]["theme"],
		items: AutocompleteItem[],
		detailsByValue: Map<string, string[]>,
		done: (result: undefined) => void,
	) {
		super(theme, () => done(undefined), () => done(undefined), undefined, {
			leftTitle: "Topics",
			rightTitle: "Observations",
			leftPaneRatio: 0.4,
		});
		this.detailsByValue = detailsByValue;
		this.setOnSelectionChange((item) => {
			if (!item) {
				this.setRightLines(["No topic selected"]);
				return;
			}
			this.setRightLines(this.detailsByValue.get(item.value) ?? ["No observations available"]);
		});
		this.setItems(items);
		this.setRightLines(items[0] ? this.detailsByValue.get(items[0].value) ?? ["No observations available"] : ["No observations yet"]);
	}
}
