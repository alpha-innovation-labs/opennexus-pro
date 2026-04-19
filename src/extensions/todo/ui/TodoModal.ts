import { ExtensionEditorComponent } from "@mariozechner/pi-coding-agent";
import { Container, Key, matchesKey, truncateToWidth, type Focusable, type TUI } from "@mariozechner/pi-tui";
import { createTodoItem } from "../model/createTodoItem.js";
import { normalizeTodoText } from "../model/normalizeTodoText.js";
import { sortTodoItems } from "../model/sortTodoItems.js";
import type { PersistTodoItems, TodoItem, TodoNotify, TodoTheme } from "../model/types.js";
import { beginTodoEdit } from "../runtime/beginTodoEdit.js";
import { clampTodoSelection } from "../runtime/clampTodoSelection.js";
import { deleteSelectedTodo } from "../runtime/deleteSelectedTodo.js";
import { syncTodoScrollOffset } from "../runtime/syncTodoScrollOffset.js";
import { toggleSelectedTodo } from "../runtime/toggleSelectedTodo.js";
import { frameTodoLine } from "./frameTodoLine.js";
import { renderTodoHelpLines } from "./renderTodoHelpLines.js";
import { renderTodoInput } from "./renderTodoInput.js";
import { renderTodoListLines } from "./renderTodoListLines.js";
import { renderTodoTopBorder } from "./renderTodoTopBorder.js";
import { setTodoInputText } from "./setTodoInputText.js";
type TodoMode = "normal" | "add" | "edit";
/** Modal UI for viewing, selecting, adding, editing, and deleting todo items. */
export class TodoModal extends Container implements Focusable {
	private focusedState = false;
	private readonly input: ExtensionEditorComponent;
	private readonly items: TodoItem[];
	private selectedIndex: number;
	private editingId: string | null = null;
	private mode: TodoMode = "normal";
	private helpVisible = false;
	private helpReturnMode: TodoMode = "normal";
	private pendingGotoTop = false;
	private pendingDelete = false;
	private scrollOffset = 0;
	private lastBodyHeight = 10;
	private persisting = false;
	/** Creates the todo modal. */
	constructor(
		private readonly tui: TUI,
		private readonly theme: TodoTheme,
		keybindings: any,
		initialItems: TodoItem[],
		private readonly persistItems: PersistTodoItems,
		private readonly notify: TodoNotify,
		private readonly onClose: () => void,
	) {
		super();
		this.items = [...initialItems];
		this.selectedIndex = this.items.length > 0 ? this.items.length - 1 : -1;
		this.input = new ExtensionEditorComponent(tui, keybindings, "Todo", "", (value) => void this.submitInput(value), () => this.exitEditMode());
	}
	/** Returns whether the modal owns focus. */ get focused(): boolean { return this.focusedState; }
	/** Updates modal and input focus state. */ set focused(value: boolean) {
		this.focusedState = value;
		this.input.focused = value && !this.helpVisible && this.mode !== "normal";
	}
	/** Handles modal keyboard input. */ handleInput(data: string): void {
		if (matchesKey(data, Key.ctrl("c"))) return this.onClose();
		if (data === "?") return this.helpVisible ? this.closeHelp() : this.openHelp();
		if (matchesKey(data, Key.escape)) return this.handleEscape();
		if (this.helpVisible) return;
		if (this.mode === "normal") return this.handleNormalInput(data);
		this.input.handleInput(data);
		this.tui.requestRender();
	}
	/** Declares that the modal has no cached off-screen state. */ invalidate(): void {}
	/** Renders the todo list and input. */ render(width: number): string[] {
		const dialogWidth = Math.max(60, Math.min(width, Math.floor(width * 0.72)));
		const innerWidth = Math.max(58, dialogWidth - 2);
		const inputLines = renderTodoInput(this.input, this.theme, innerWidth, this.mode);
		const bodyHeight = Math.max(8, Math.floor((this.tui.terminal.rows ?? 40) * 0.65) - inputLines.length - 2);
		this.lastBodyHeight = bodyHeight;
		this.scrollOffset = syncTodoScrollOffset(this.items, this.selectedIndex, this.scrollOffset, bodyHeight);
		const title = " Todo ";
		const body = this.getBodyLines(innerWidth, bodyHeight).map((line) => frameTodoLine(this.theme, line, innerWidth));
		const inputSpacer = frameTodoLine(this.theme, "", innerWidth);
		const framedInput = inputLines.map((line) => frameTodoLine(this.theme, line, innerWidth));
		const bottom = this.theme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`);
		return [renderTodoTopBorder(this.theme, innerWidth, title), ...body, inputSpacer, ...framedInput, bottom].map((line) => truncateToWidth(line, dialogWidth, ""));
	}
	/** Handles Normal-mode list input. */ private handleNormalInput(data: string): void {
		if (data === "a") return this.beginAdding();
		if (data === "e") return this.beginEditing();
		if (data === "x") return this.toggleSelectedItem();
		if (data === "G") return this.moveSelectionTo(this.items.length - 1);
		if (data === "g") return this.pendingGotoTop ? this.moveSelectionTo(0) : void (this.pendingGotoTop = true);
		if (data === "j" || matchesKey(data, Key.down)) return this.moveSelectionBy(1);
		if (data === "k" || matchesKey(data, Key.up)) return this.moveSelectionBy(-1);
		if (data === "d") return this.pendingDelete ? void this.deleteSelectedItem() : void (this.pendingDelete = true);
		this.resetPendingState();
		this.tui.requestRender();
	}
	/** Saves the current input as a new or edited todo. */ private async submitInput(value: string): Promise<void> {
		const text = normalizeTodoText(value);
		if (!text) return this.notify("Todo cannot be empty", "warning");
		if (this.persisting) return;
		this.persisting = true;
		try {
			if (this.editingId) {
				const index = this.items.findIndex((item) => item.id === this.editingId);
				if (index >= 0) this.items[index] = { ...this.items[index]!, text, updatedAt: Date.now() };
			} else {
				const item = createTodoItem(text);
				this.items.push(item);
				this.editingId = item.id;
			}
			this.items.splice(0, this.items.length, ...sortTodoItems([...this.items]));
			this.selectedIndex = this.items.findIndex((item) => item.id === this.editingId);
			await this.persistItems([...this.items]);
			this.exitEditMode();
			this.scrollOffset = syncTodoScrollOffset(this.items, this.selectedIndex, this.scrollOffset, this.lastBodyHeight);
		} catch (error) {
			this.notify(error instanceof Error ? error.message : String(error), "error");
		} finally {
			this.persisting = false;
			this.tui.requestRender();
		}
	}
	/** Deletes the selected todo item. */ private deleteSelectedItem(): void {
		if (this.persisting) return;
		this.pendingDelete = false;
		const next = deleteSelectedTodo(this.items, this.selectedIndex, this.editingId);
		this.items.splice(0, this.items.length, ...next.items);
		this.selectedIndex = next.selectedIndex;
		this.editingId = next.editingId;
		this.afterListMutation();
	}
	/** Toggles completion for the selected todo item. */ private toggleSelectedItem(): void {
		if (this.persisting) return;
		const next = toggleSelectedTodo(this.items, this.selectedIndex);
		this.items.splice(0, this.items.length, ...next.items);
		this.selectedIndex = next.selectedIndex;
		this.afterListMutation();
	}
	/** Loads the selected todo into the editor and enters Edit mode. */ private beginEditing(): void {
		this.editingId = beginTodoEdit(this.items[this.selectedIndex], this.input);
		if (!this.editingId) return;
		this.mode = "edit";
		this.resetPendingState();
		this.input.focused = this.focusedState;
		this.tui.requestRender();
	}
	/** Clears the editor and enters Add mode. */ private beginAdding(): void {
		this.editingId = null;
		this.mode = "add";
		this.resetPendingState();
		setTodoInputText(this.input, "");
		this.input.focused = this.focusedState;
		this.tui.requestRender();
	}
	/** Returns from Add/Edit back to Normal mode. */ private exitEditMode(): void {
		this.mode = "normal";
		this.editingId = null;
		this.resetPendingState();
		setTodoInputText(this.input, "");
		this.input.focused = false;
		this.tui.requestRender();
	}
	/** Opens the help list and remembers the current mode. */ private openHelp(): void {
		this.helpReturnMode = this.mode;
		this.helpVisible = true;
		this.input.focused = false;
		this.tui.requestRender();
	}
	/** Hides the help list and restores the previous mode focus. */ private closeHelp(): void {
		this.helpVisible = false;
		this.mode = this.helpReturnMode;
		this.input.focused = this.focusedState && this.mode !== "normal";
		this.tui.requestRender();
	}
	/** Handles Escape based on the current help or edit state. */ private handleEscape(): void {
		if (this.helpVisible) return this.closeHelp();
		if (this.mode !== "normal") this.exitEditMode();
	}
	/** Returns either todo rows or help rows for the body area. */ private getBodyLines(width: number, height: number): string[] {
		return this.helpVisible ? renderTodoHelpLines(this.theme, width, height) : renderTodoListLines(this.theme, this.items, width, height, this.selectedIndex, this.scrollOffset, this.editingId);
	}
	/** Persists mutated list state and refreshes the view. */ private afterListMutation(): void {
		this.scrollOffset = syncTodoScrollOffset(this.items, this.selectedIndex, this.scrollOffset, this.lastBodyHeight);
		void this.persistItems([...this.items]).catch((error) => this.notify(error instanceof Error ? error.message : String(error), "error"));
		this.tui.requestRender();
	}
	/** Clears pending multi-key Normal-mode state. */ private resetPendingState(): void { this.pendingGotoTop = false; this.pendingDelete = false; }
	/** Moves selection by one relative step. */ private moveSelectionBy(delta: number): void { this.resetPendingState(); this.moveSelectionTo(this.selectedIndex + delta); }
	/** Moves selection to one absolute index. */ private moveSelectionTo(index: number): void {
		if (this.items.length === 0) return;
		this.resetPendingState();
		this.selectedIndex = clampTodoSelection(index, this.items.length);
		this.scrollOffset = syncTodoScrollOffset(this.items, this.selectedIndex, this.scrollOffset, this.lastBodyHeight);
		this.tui.requestRender();
	}
}
