/**
 * Formats a chart timestamp as compact local date and time.
 *
 * @param timestamp Unix timestamp in seconds or milliseconds.
 * @returns Local MM/DD HH:mm time label.
 */
export function formatChartTime(timestamp: number): string {
	const milliseconds = timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp;
	const parts = new Intl.DateTimeFormat("en-US", {
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).formatToParts(new Date(milliseconds));
	const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
	return `${get("month")}/${get("day")} ${get("hour")}:${get("minute")}`;
}
