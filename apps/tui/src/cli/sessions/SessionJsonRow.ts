/** Session data prepared for machine-readable CLI JSON output. */
export interface SessionJsonRow {
	id: string;
	title: string;
	cwd: string;
	path: string;
	created: string;
	modified: string;
	messageCount: number;
	firstMessage: string;
}
