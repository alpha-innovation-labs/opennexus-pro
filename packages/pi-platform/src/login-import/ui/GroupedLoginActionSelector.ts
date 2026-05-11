import { Container, getKeybindings, Spacer, Text } from "@earendil-works/pi-tui";
import type { LoginAction, LoginActionGroup } from "./LoginAction.js";
import { flattenLoginActionGroups } from "./flattenLoginActionGroups.js";

/**
 * Renders the grouped top-level /login action selector.
 */
export class GroupedLoginActionSelector extends Container {
	private readonly groups: readonly LoginActionGroup[];
	private readonly onSelectCallback: (action: LoginAction) => void;
	private readonly onCancelCallback: () => void;
	private readonly listContainer = new Container();
	private selectedActionIndex = 0;

	/**
	 * Creates a grouped /login selector.
	 *
	 * @param title Selector title.
	 * @param groups Grouped login actions.
	 * @param onSelect Invoked when an action is selected.
	 * @param onCancel Invoked when selection is cancelled.
	 */
	constructor(
		title: string,
		groups: readonly LoginActionGroup[],
		onSelect: (action: LoginAction) => void,
		onCancel: () => void,
	) {
		super();
		this.groups = groups;
		this.onSelectCallback = onSelect;
		this.onCancelCallback = onCancel;
		this.addChild(new Text(title, 1, 0));
		this.addChild(new Spacer(1));
		this.addChild(this.listContainer);
		this.addChild(new Spacer(1));
		this.addChild(new Text("↑↓ navigate  Enter select  Esc cancel", 1, 0));
		this.updateList();
	}

	/**
	 * Handles keyboard navigation and selection.
	 *
	 * @param keyData Raw terminal input.
	 */
	handleInput(keyData: string): void {
		const kb = getKeybindings();
		const actionCount = this.groups.reduce((count, group) => count + group.actions.length, 0);
		if (kb.matches(keyData, "tui.select.up") || keyData === "k") {
			this.selectedActionIndex = Math.max(0, this.selectedActionIndex - 1);
			this.updateList();
			return;
		}
		if (kb.matches(keyData, "tui.select.down") || keyData === "j") {
			this.selectedActionIndex = Math.min(actionCount - 1, this.selectedActionIndex + 1);
			this.updateList();
			return;
		}
		if (kb.matches(keyData, "tui.select.confirm") || keyData === "\n" || keyData === "\r") {
			const action = this.getSelectedAction();
			if (action) {
				this.onSelectCallback(action);
			}
			return;
		}
		if (kb.matches(keyData, "tui.select.cancel") || keyData === "\x1b") {
			this.onCancelCallback();
		}
	}

	/**
	 * Returns the currently selected action.
	 *
	 * @returns Selected login action, when present.
	 */
	private getSelectedAction(): LoginAction | undefined {
		return this.groups.flatMap((group) => group.actions)[this.selectedActionIndex];
	}

	/**
	 * Rebuilds the visible selector rows.
	 */
	private updateList(): void {
		this.listContainer.clear();
		let actionIndex = 0;
		for (const row of flattenLoginActionGroups(this.groups)) {
			if (row.kind === "heading") {
				this.listContainer.addChild(new Text(row.title, 1, 0));
				continue;
			}
			const prefix = actionIndex === this.selectedActionIndex ? "→ " : "  ";
			this.listContainer.addChild(new Text(`${prefix}${row.action.label}`, 1, 0));
			actionIndex += 1;
		}
	}
}
