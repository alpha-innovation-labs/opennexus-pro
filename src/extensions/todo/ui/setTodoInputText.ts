import type { ExtensionEditorComponent } from "@mariozechner/pi-coding-agent";
import { getTodoInputEditor } from "./getTodoInputEditor.js";

/**
 * Writes text into Pi's extension editor wrapper.
 *
 * @param input Wrapped extension editor component.
 * @param text Text to place into the editor.
 */
export function setTodoInputText(input: ExtensionEditorComponent, text: string): void {
	getTodoInputEditor(input)?.setText(text);
}
