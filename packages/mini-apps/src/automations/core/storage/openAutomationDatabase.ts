import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { getAutomationDbPath } from "../paths/getAutomationDbPath.js";
import type { AutomationDatabase } from "./AutomationDatabase.js";

const requireRuntimeModule = createRequire(import.meta.url);

/**
 * Opens the configured automations SQLite database.
 *
 * @returns SQLite database handle.
 */
export function openAutomationDatabase(): AutomationDatabase {
	const dbPath = getAutomationDbPath();
	mkdirSync(dirname(dbPath), { recursive: true });
	const moduleName = process.versions.bun ? "bun:sqlite" : "node:sqlite";
	const sqliteModule = requireRuntimeModule(moduleName) as { Database?: new (path: string) => AutomationDatabase; DatabaseSync?: new (path: string) => AutomationDatabase };
	const Database = sqliteModule.DatabaseSync ?? sqliteModule.Database;
	if (!Database) throw new Error(`SQLite runtime is unavailable: ${moduleName}`);
	return new Database(dbPath);
}
