import type { ExtensionEditorComponent } from "@mariozechner/pi-coding-agent";
import type { Editor } from "@mariozechner/pi-tui";

/**
 * Reads the wrapped Pi editor instance from the extension editor component.
 *
 * @param input Wrapped extension editor component.
 * @returns Inner editor instance or null.
 */
export function getTodoInputEditor(input: ExtensionEditorComponent): Editor | null {
	return (input as ExtensionEditorComponent & { editor?: Editor }).editor ?? null;
}
