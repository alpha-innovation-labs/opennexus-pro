import { readFile } from "node:fs/promises";
import type { TodoItem } from "../model/types.js";
import { sortTodoItems } from "../model/sortTodoItems.js";
import { getTodoItemsPath } from "./getTodoItemsPath.js";

/**
 * Reads persisted todo items for one project cwd.
 *
 * @param cwd Project working directory.
 * @returns Stored todo items.
 */
export async function readTodoItems(cwd: string): Promise<TodoItem[]> {
	try {
		const content = await readFile(getTodoItemsPath(cwd), "utf8");
		const parsed = JSON.parse(content) as { cwd?: string; items?: unknown } | unknown[];
		const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : [];
		if (!Array.isArray(items)) return [];
		return sortTodoItems(items.flatMap((item): TodoItem[] => {
			if (!item || typeof item !== "object") return [];
			if (typeof item.id !== "string" || typeof item.text !== "string") return [];
			const done = typeof item.done === "boolean" ? item.done : false;
			const createdAt = typeof item.createdAt === "number" ? item.createdAt : Date.now();
			const updatedAt = typeof item.updatedAt === "number" ? item.updatedAt : createdAt;
			return [{ id: item.id, text: item.text, done, createdAt, updatedAt }];
		}));
	} catch {
		return [];
	}
}
