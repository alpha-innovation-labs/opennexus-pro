import { Key, matchesKey } from "@earendil-works/pi-tui";
import { encodeSlashMenuValue } from "./encodeSlashMenuValue";
import { isSlashTextInput } from "./isSlashTextInput";
import type { SlashMenuLevel } from "./SlashMenuLevel";

/**
 * Handles key input owned by the slash-menu shell.
 *
 * @param input Current key event and menu callbacks.
 * @returns Whether the key was handled.
 */
export function handleSlashMenuInput(input: {
	data: string;
	level: SlashMenuLevel;
	query: string;
	scopedSelection: Set<string>;
	setQuery: (query: string) => void;
	setBottom: (title: string, value: string, prefix: string) => void;
	refresh: () => void;
	handleEscape: () => void;
	delegateInput: () => void;
	onCommandPicked: (commandText: string) => void;
}): boolean {
	if (matchesKey(input.data, Key.ctrl("c"))) {
		input.delegateInput();
		return true;
	}
	if (matchesKey(input.data, Key.escape)) {
		input.handleEscape();
		return true;
	}
	if (
		matchesKey(input.data, Key.enter) ||
		matchesKey(input.data, Key.up) ||
		matchesKey(input.data, Key.down) ||
		matchesKey(input.data, Key.ctrl("n")) ||
		matchesKey(input.data, Key.ctrl("p"))
	) {
		input.delegateInput();
		return true;
	}
	if (
		input.level === "scoped-models" &&
		(input.data === "s" || matchesKey(input.data, Key.ctrl("s")))
	) {
		input.onCommandPicked(
			`/nexus-scoped-models-save ${encodeSlashMenuValue([...input.scopedSelection].join("\n"))}`,
		);
		return true;
	}
	if (input.data === "\u007f" || matchesKey(input.data, Key.backspace)) {
		const nextQuery = input.query.slice(0, -1);
		input.setQuery(nextQuery);
		input.setBottom("Search", nextQuery, "> /");
		input.refresh();
		return true;
	}
	if (!isSlashTextInput(input.data)) return false;
	const nextQuery = `${input.query}${input.data}`;
	input.setQuery(nextQuery);
	input.setBottom("Search", nextQuery, "> /");
	input.refresh();
	return true;
}
