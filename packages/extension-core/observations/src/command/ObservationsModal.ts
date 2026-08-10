import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import type { AutocompleteItem } from "@earendil-works/pi-tui";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index";

/**
 * Two-pane modal for browsing observation topics and details.
 */
export class ObservationsModal extends SelectPreviewModal {
	private detailsByValue: Map<string, string[]>;

	constructor(
		theme: ExtensionCommandContext["ui"]["theme"],
		items: AutocompleteItem[],
		detailsByValue: Map<string, string[]>,
		done: (result: undefined) => void,
		private readonly onEditPrompt: () => void = () => undefined,
		private readonly promptEditingEnabled = true,
		private readonly onRecreateObservation: () => void = () => undefined,
	) {
		super(theme, () => done(undefined), () => done(undefined), undefined, {
			leftTitle: "Topics",
			rightTitle: "Observations",
			leftPaneRatio: 0.4,
		});
		this.footerHotkeys = [
			{ key: "r", label: "recreate" },
			...(promptEditingEnabled ? [{ key: "e", label: "edit prompt" }] : []),
		];
		this.detailsByValue = detailsByValue;
		this.setOnSelectionChange((item) => {
			if (!item) {
				this.setRightLines(["No topic selected"]);
				return;
			}
			this.setRightLines(this.detailsByValue.get(item.value) ?? ["No observations available"]);
		});
		this.setObservationSections(items, detailsByValue);
	}

	/**
	 * Replaces modal topics and details after observation regeneration.
	 *
	 * @param items Selectable topic items.
	 * @param detailsByValue Detail lines keyed by topic value.
	 */
	setObservationSections(items: AutocompleteItem[], detailsByValue: Map<string, string[]>): void {
		this.detailsByValue = detailsByValue;
		this.setItems(items);
		this.setRightLines(items[0] ? this.detailsByValue.get(items[0].value) ?? ["No observations available"] : ["No observations yet"]);
	}

	/** Routes observation modal hotkeys before the base selector handles input. */
	override handleInput(data: string): void {
		if (data === "r") {
			this.onRecreateObservation();
			return;
		}
		if (this.promptEditingEnabled && data === "e") {
			this.onEditPrompt();
			return;
		}
		super.handleInput(data);
	}
}
