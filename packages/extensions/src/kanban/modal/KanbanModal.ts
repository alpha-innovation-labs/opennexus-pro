import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";

/**
 * Two-pane modal for browsing temporary kanban tasks.
 */
export class KanbanModal extends SelectPreviewModal {
	private readonly detailsByValue: Map<string, string[]>;
	private readonly completedLines: string[];

	constructor(
		theme: ExtensionCommandContext["ui"]["theme"],
		items: AutocompleteItem[],
		detailsByValue: Map<string, string[]>,
		completedLines: string[],
		done: (result: undefined) => void,
	) {
		super(theme, () => done(undefined), () => done(undefined), undefined, {
			leftTitle: "In Loop",
			rightTitle: "Completed",
			leftPaneRatio: 0.45,
			bottomTitle: "Selected Task",
			bottomPrefix: "• ",
		});
		this.detailsByValue = detailsByValue;
		this.completedLines = completedLines;
		this.setOnSelectionChange((item) => {
			this.setBottom("Selected Task", item?.label ?? "Nothing selected", "• ");
			this.setRightLines(this.buildRightLines(item));
		});
		this.setItems(items);
		this.setBottom("Selected Task", items[0]?.label ?? "Nothing selected", "• ");
		this.setRightLines(this.buildRightLines(items[0] ?? null));
	}

	/**
	 * Builds the completed-pane lines while keeping selected task context visible.
	 *
	 * @param item Currently selected in-loop item.
	 * @returns Right pane lines.
	 */
	private buildRightLines(item: AutocompleteItem | null): string[] {
		const detailLines = item ? this.detailsByValue.get(item.value) ?? ["No task details available"] : ["No task selected"];
		return ["Done", "", ...this.completedLines, "", "Selected", "", ...detailLines];
	}
}
