/**
 * Parses a user-facing hour like 9am or 14:30.
 *
 * @param text Hour text.
 * @returns Minute and hour cron fields.
 */
export function parseHourText(text: string): { minute: number; hour: number } {
	const match = text.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/u);
	if (!match) throw new Error(`Invalid time: ${text}`);
	let hour = Number(match[1]);
	const minute = match[2] ? Number(match[2]) : 0;
	if (match[3] === "pm" && hour < 12) hour += 12;
	if (match[3] === "am" && hour === 12) hour = 0;
	if (hour > 23 || minute > 59) throw new Error(`Invalid time: ${text}`);
	return { minute, hour };
}
