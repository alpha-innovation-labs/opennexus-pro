import type { SocialAutomationDatabase } from "../shared/SocialAutomationDatabase.js";
import { initializeSocialAutomationSchema } from "./initializeSocialAutomationSchema.js";
import { openSocialAutomationDatabase } from "./openSocialAutomationDatabase.js";

/**
 * Opens and initializes the social automation database for one operation.
 *
 * @param dbPath Optional database path override.
 * @param callback Database operation.
 * @returns Callback result.
 */
export function withSocialAutomationDatabase<T>(dbPath: string | undefined, callback: (db: SocialAutomationDatabase) => T): T {
	const db = openSocialAutomationDatabase(dbPath);
	try {
		initializeSocialAutomationSchema(db);
		return callback(db);
	} finally {
		db.close();
	}
}
