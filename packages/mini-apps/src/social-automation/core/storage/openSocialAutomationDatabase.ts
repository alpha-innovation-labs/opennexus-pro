import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { getSocialAutomationDbPath } from "../paths/getSocialAutomationDbPath.js";
import type { SocialAutomationDatabase } from "../shared/SocialAutomationDatabase.js";

const requireRuntimeModule = createRequire(import.meta.url);

/**
 * Opens the social automation SQLite database.
 *
 * @param dbPath Optional database path override.
 * @returns SQLite database handle.
 */
export function openSocialAutomationDatabase(dbPath?: string): SocialAutomationDatabase {
	const resolvedPath = getSocialAutomationDbPath(dbPath);
	mkdirSync(dirname(resolvedPath), { recursive: true, mode: 0o700 });
	const moduleName = process.versions.bun ? "bun:sqlite" : "node:sqlite";
	const sqliteModule = requireRuntimeModule(moduleName) as { Database?: new (path: string) => SocialAutomationDatabase; DatabaseSync?: new (path: string) => SocialAutomationDatabase };
	const Database = sqliteModule.DatabaseSync ?? sqliteModule.Database;
	if (!Database) throw new Error(`SQLite runtime is unavailable: ${moduleName}`);
	return new Database(resolvedPath);
}
