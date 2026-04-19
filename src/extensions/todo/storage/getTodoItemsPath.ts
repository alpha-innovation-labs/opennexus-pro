import { resolve } from "node:path";
import { createTodoProjectKey } from "./createTodoProjectKey.js";
import { getTodoDir } from "./getTodoDir.js";

/**
 * Resolves the todo items JSON path for one project cwd.
 *
 * @param cwd Project working directory.
 * @returns Absolute todo items file path.
 */
export function getTodoItemsPath(cwd: string): string {
	return resolve(getTodoDir(), `${createTodoProjectKey(cwd)}.items.json`);
}
