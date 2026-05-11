/**
 * Formats an automation run timestamp compactly for the panel.
 *
 * @param iso Timestamp in ISO format.
 * @param includeDate Whether to include the date.
 * @returns Compact local timestamp.
 */
export function formatAutomationRunTime(iso: string | null, includeDate: boolean): string {
	if (!iso) return "n/a";
	const [date = "", time = ""] = iso.split("T");
	const compactTime = time.slice(0, 5);
	return includeDate ? `${date} ${compactTime}` : compactTime;
}
