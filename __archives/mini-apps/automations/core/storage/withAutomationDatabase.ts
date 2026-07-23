import type { AutomationDatabase } from "./AutomationDatabase.js";
import { initializeAutomationSchema } from "./initializeAutomationSchema.js";
import { openAutomationDatabase } from "./openAutomationDatabase.js";

/**
 * Opens the automations database, initializes schema, and closes it after use.
 *
 * @param callback Database operation to run.
 * @returns Callback result.
 */
export function withAutomationDatabase<T>(callback: (db: AutomationDatabase) => T): T {
	const db = openAutomationDatabase();
	try {
		initializeAutomationSchema(db);
		return callback(db);
	} finally {
		db.close();
	}
}
