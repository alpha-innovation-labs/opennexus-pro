import type { AutocompleteItem } from "@mariozechner/pi-tui";

/**
 * Temporary kanban board data used until persistence is added.
 */
export type TempKanbanBoard = {
	inLoopItems: AutocompleteItem[];
	completedLines: string[];
	detailsByValue: Map<string, string[]>;
};

/**
 * Creates temporary kanban items for the extension modal.
 *
 * @returns Temporary in-loop items, completed lines, and preview details.
 */
export function createTempKanbanBoard(): TempKanbanBoard {
	const inLoopItems: AutocompleteItem[] = [
		{
			label: "Polish modal layout",
			value: "polish-modal-layout",
			description: "Design",
		},
		{
			label: "Wire up temp board data",
			value: "wire-temp-board-data",
			description: "Implementation",
		},
		{
			label: "Add regression test",
			value: "add-regression-test",
			description: "QA",
		},
	];
	const completedLines = [
		"• Draft extension folder structure",
		"• Pick two-pane modal shell",
		"• Add starter command copy",
	];
	const detailsByValue = new Map<string, string[]>([
		[
			"polish-modal-layout",
			[
				"Task: Polish modal layout",
				"",
				"Status: In loop",
				"Owner: Nexus UI",
				"Next step: tighten pane labels and spacing",
			],
		],
		[
			"wire-temp-board-data",
			[
				"Task: Wire up temp board data",
				"",
				"Status: In loop",
				"Owner: Extension runtime",
				"Next step: swap temp data for persisted tasks",
			],
		],
		[
			"add-regression-test",
			[
				"Task: Add regression test",
				"",
				"Status: In loop",
				"Owner: Test harness",
				"Next step: cover modal rendering and command registration",
			],
		],
	]);

	return {
		inLoopItems,
		completedLines,
		detailsByValue,
	};
}
