import { randomUUID } from "node:crypto";
import type { TodoItem } from "./types.js";

/**
 * Builds one new todo item from submitted text.
 *
 * @param text Normalized todo text.
 * @returns New todo item.
 */
export function createTodoItem(text: string): TodoItem {
	const now = Date.now();
	return {
		id: randomUUID(),
		text,
		done: false,
		createdAt: now,
		updatedAt: now,
	};
}
