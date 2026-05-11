import type { AutomationDatabase } from "./AutomationDatabase.js";

/**
 * Creates automation storage tables when they do not exist.
 *
 * @param db SQLite database handle.
 */
export function initializeAutomationSchema(db: AutomationDatabase): void {
	db.exec(`
		CREATE TABLE IF NOT EXISTS automations (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL UNIQUE,
			schedule_text TEXT NOT NULL,
			cron_expression TEXT NOT NULL,
			prompt TEXT NOT NULL,
			cwd TEXT NOT NULL,
			enabled INTEGER NOT NULL,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL,
			next_run_at TEXT
		);
		CREATE TABLE IF NOT EXISTS automation_runs (
			id TEXT PRIMARY KEY,
			automation_id TEXT NOT NULL,
			status TEXT NOT NULL,
			started_at TEXT NOT NULL,
			finished_at TEXT,
			exit_code INTEGER,
			pid INTEGER,
			session_path TEXT,
			log_path TEXT,
			error TEXT,
			FOREIGN KEY (automation_id) REFERENCES automations(id) ON DELETE CASCADE
		);
		CREATE INDEX IF NOT EXISTS idx_automations_next_run_at ON automations(enabled, next_run_at);
		CREATE INDEX IF NOT EXISTS idx_automation_runs_automation_id ON automation_runs(automation_id, started_at);
	`);
}
