import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { TwoPaneSelectModal } from "../../shared/two-pane-select-modal/index.js";
import { USER_HEADER_PREFIX } from "./constants.js";
import { getGroupDurationLabel } from "./getGroupDurationLabel.js";
import { renderBuiltInToolDetails } from "./renderBuiltInToolDetails.js";
import { summarizeToolCall } from "./summarizeToolCall.js";
import type { ToolCallGroup, ToolCallInfo } from "./types.js";

/**
 * Two-pane modal for browsing tool calls and rendered details.
 */
export class ToolCallsModal extends TwoPaneSelectModal {
	private readonly groups: ToolCallGroup[];
	private readonly toolCalls: Map<string, ToolCallInfo>;
	private itemsByValue = new Map<string, AutocompleteItem>();
	private selectedValue?: string;
	private collapsed = false;
	private readonly detailTheme: ExtensionCommandContext["ui"]["theme"];

	constructor(
		theme: ExtensionCommandContext["ui"]["theme"],
		groups: ToolCallGroup[],
		toolCalls: Map<string, ToolCallInfo>,
		done: () => void,
	) {
		super(theme, () => {}, () => done(), undefined, {
			leftTitle: "Calls",
			rightTitle: "Details",
			leftPaneRatio: 0.5,
			itemMaxLines: (item) => (item.value.startsWith(USER_HEADER_PREFIX) ? 3 : 1),
			itemStyles: {
				label: (item, selected, text, uiTheme) =>
					item.value.startsWith(USER_HEADER_PREFIX)
						? uiTheme.fg("error", selected ? uiTheme.bold(text) : text)
						: selected
							? uiTheme.fg("accent", text)
							: text,
			},
		});
		this.detailTheme = theme;
		this.groups = groups;
		this.toolCalls = toolCalls;
		this.setOnPick((item) => {
			if (item.value.startsWith(USER_HEADER_PREFIX)) return;
			done();
		});
		this.setOnSelectionChange((item) => {
			this.selectedValue = item?.value;
			if (!item) {
				this.setRightLines(["Select a tool call to inspect its arguments and result."]);
				return;
			}
			if (item.value.startsWith(USER_HEADER_PREFIX)) {
				this.setRightLines([item.label]);
				return;
			}
			this.setRightLines(["Loading tool render…"]);
		});
		this.rebuildItems();
	}

	/**
	 * Handles modal-specific navigation and collapse shortcuts.
	 *
	 * @param data Raw terminal input.
	 */
	override handleInput(data: string): void {
		if (data === "c") {
			this.collapsed = !this.collapsed;
			this.rebuildItems(this.selectedValue);
			return;
		}
		if (data === "j") {
			this.moveSelection(1);
			return;
		}
		if (data === "k") {
			this.moveSelection(-1);
			return;
		}
		if (data === "J") {
			this.jumpSelection((item) => item.value.startsWith(USER_HEADER_PREFIX), 1);
			return;
		}
		if (data === "K") {
			this.jumpSelection((item) => item.value.startsWith(USER_HEADER_PREFIX), -1);
			return;
		}
		super.handleInput(data);
	}

	/**
	 * Renders the current modal state.
	 *
	 * @param width Available modal width.
	 * @returns Rendered lines.
	 */
	override render(width: number): string[] {
		if (this.selectedValue) {
			if (this.selectedValue.startsWith(USER_HEADER_PREFIX)) {
				const item = this.itemsByValue.get(this.selectedValue);
				if (item) this.setRightLines([item.label]);
			} else {
				const toolCall = this.toolCalls.get(this.selectedValue);
				if (toolCall) {
					const dialogWidth = Math.max(80, Math.min(width, Math.floor(width * 0.9)));
					const innerWidth = Math.max(78, dialogWidth - 2);
					const rightWidth = Math.floor((innerWidth - 1) / 2);
					this.setRightLines(renderBuiltInToolDetails(toolCall, this.detailTheme, rightWidth));
				}
			}
		}
		return super.render(width);
	}

	/**
	 * Rebuilds the displayed item list from grouped tool calls.
	 *
	 * @param preferredValue Previously selected value.
	 */
	private rebuildItems(preferredValue?: string): void {
		const items = this.buildItems();
		this.itemsByValue = new Map(items.map((item) => [item.value, item]));
		this.setItems(items);
		const nextValue = this.resolvePreferredValue(preferredValue, items);
		if (nextValue) this.selectValue(nextValue);
	}

	/**
	 * Builds the currently visible left-pane items.
	 *
	 * @returns Visible items.
	 */
	private buildItems(): AutocompleteItem[] {
		const items: AutocompleteItem[] = [];
		for (const group of [...this.groups].reverse()) {
			items.push({
				label: group.userPreview,
				value: `${USER_HEADER_PREFIX}${group.userIndex}`,
				description: getGroupDurationLabel(group.userTimestamp, group.lastAssistantTimestamp),
			});
			if (this.collapsed) continue;
			for (const toolCall of [...group.toolCalls].reverse()) {
				items.push({ label: summarizeToolCall(toolCall), value: toolCall.toolCallId });
			}
		}
		return items;
	}

	/**
	 * Resolves which value should remain selected after a list rebuild.
	 *
	 * @param preferredValue Previously selected value.
	 * @param items Rebuilt item list.
	 * @returns Selected value when available.
	 */
	private resolvePreferredValue(preferredValue: string | undefined, items: AutocompleteItem[]): string | undefined {
		if (!preferredValue) return items[0]?.value;
		if (items.some((item) => item.value === preferredValue)) return preferredValue;
		if (!preferredValue.startsWith(USER_HEADER_PREFIX)) {
			const toolCall = this.toolCalls.get(preferredValue);
			if (toolCall) {
				const headerValue = `${USER_HEADER_PREFIX}${toolCall.userIndex}`;
				if (items.some((item) => item.value === headerValue)) return headerValue;
			}
		}
		return items[0]?.value;
	}
}
