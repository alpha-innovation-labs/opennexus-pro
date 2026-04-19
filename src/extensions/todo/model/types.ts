import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { OverlayHandle } from "@mariozechner/pi-tui";

/**
 * One persisted todo row.
 */
export type TodoItem = {
	id: string;
	text: string;
	done: boolean;
	createdAt: number;
	updatedAt: number;
};

/**
 * Minimal overlay state for the todo extension.
 */
export type TodoExtensionState = {
	overlayHandle: OverlayHandle | null;
	finish: (() => void) | null;
	activeCwd: string | null;
};

/**
 * Theme type used by the todo UI.
 */
export type TodoTheme = ExtensionContext["ui"]["theme"];

/**
 * Persists a full todo list snapshot.
 */
export type PersistTodoItems = (items: TodoItem[]) => Promise<void>;

/**
 * Emits a todo UI notification.
 */
export type TodoNotify = (message: string, level: "warning" | "error") => void;
