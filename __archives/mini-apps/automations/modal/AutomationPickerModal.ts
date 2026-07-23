import type { AutocompleteItem } from "@earendil-works/pi-tui";
import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";
import { listLatestRunsForAutomation } from "../core/storage/listLatestRunsForAutomation.js";
import type { AutomationRecord } from "../core/storage/types.js";
import { createAutomationPickerItems } from "./createAutomationPickerItems.js";
import { createAutomationPreviewLines } from "./createAutomationPreviewLines.js";
import type { AutomationRunSummaryProvider } from "./types.js";

/** Full-screen picker for stored automations. */
export class AutomationPickerModal extends SelectPreviewModal {
	constructor(theme: ExtensionCommandContext["ui"]["theme"], private readonly automations: AutomationRecord[], onPickAutomation: (automation: AutomationRecord) => void, done: () => void, private readonly getLatestRuns: AutomationRunSummaryProvider = (automationId) => listLatestRunsForAutomation(automationId, 2)) {
		super(theme, (item) => {
			const automation = this.findAutomation(item);
			if (automation) onPickAutomation(automation);
		}, done, undefined, { fullScreen: true, leftTitle: "Automations", rightTitle: "Details", leftPaneRatio: 0.34, bottomTitle: "Keys" });
		this.setOnSelectionChange((item) => {
			const automation = this.findAutomation(item);
			this.setRightLines(createAutomationPreviewLines(automation, automation ? this.getLatestRuns(automation.id) : []));
		});
		this.setItems(createAutomationPickerItems(automations));
		this.setBottom("Keys", "enter open · arrows move · esc close", "");
	}

	/** Finds the automation for a picker item. */
	private findAutomation(item: AutocompleteItem | null): AutomationRecord | undefined {
		return this.automations.find((automation) => automation.id === item?.value);
	}
}
