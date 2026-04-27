import { withFileMutationQueue } from "@mariozechner/pi-coding-agent";
import { writeFile } from "node:fs/promises";
import type { TodoItem } from "../model/types.js";
import { ensureTodoDir } from "./ensureTodoDir.js";
import { getTodoDir } from "./getTodoDir.js";
import { getTodoItemsPath } from "./getTodoItemsPath.js";

/**
 * Persists todo items for one project cwd.
 *
 * @param cwd Project working directory.
 * @param items Todo items to write.
 */
export async function writeTodoItems(cwd: string, items: TodoItem[]): Promise<void> {
	const dir = getTodoDir();
	const path = getTodoItemsPath(cwd);
	await ensureTodoDir(dir);
	await withFileMutationQueue(path, async () => {
		await writeFile(path, `${JSON.stringify({ cwd, items }, null, 2)}\n`, "utf8");
	});
}
