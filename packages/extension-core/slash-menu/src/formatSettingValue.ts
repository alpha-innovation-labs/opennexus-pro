/**
 * Formats one settings value for menu display.
 *
 * @param value Setting value.
 * @returns Display label.
 */
export function formatSettingValue(value: unknown): string {
	if (typeof value === "boolean") return value ? "on" : "off";
	if (typeof value === "string") return value;
	if (typeof value === "number") return `${value}`;
	if (Array.isArray(value)) return `[${value.length}]`;
	if (value && typeof value === "object") return "{…}";
	if (value === undefined) return "unset";
	return String(value);
}
