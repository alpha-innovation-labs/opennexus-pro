import type { ExtensionEditorComponent } from "@mariozechner/pi-coding-agent";
import type { TodoItem } from "../model/types.js";
import { setTodoInputText } from "../ui/setTodoInputText.js";

/**
 * Loads the selected todo into the input editor.
 *
 * @param item Selected todo item.
 * @param input Todo editor component.
 * @returns Editing item id or null.
 */
export function beginTodoEdit(item: TodoItem | undefined, input: ExtensionEditorComponent): string | null {
	if (!item) return null;
	setTodoInputText(input, item.text);
	return item.id;
}
