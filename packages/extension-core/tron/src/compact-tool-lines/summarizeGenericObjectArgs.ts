import { firstLine } from "./firstLine";
import type { SummaryText } from "./SummaryText";
import { truncateSingleLine } from "./truncateSingleLine";

const MAIN_FIELD_NAMES = [
	"subject",
	"title",
	"question",
	"query",
	"prompt",
	"description",
	"url",
	"path",
	"name",
	"id",
];
const OPTION_FIELD_NAMES = [
	"action",
	"status",
	"mode",
	"type",
	"provider",
	"limit",
	"offset",
	"activeForm",
];

/**
 * Builds a readable compact summary for unknown object-shaped tool arguments.
 *
 * @param args Raw tool-call arguments.
 * @returns Main human-readable fields and compact option fields.
 */
export function summarizeGenericObjectArgs(args: unknown): SummaryText {
	if (!args || typeof args !== "object" || Array.isArray(args)) {
		return {
			main: truncateSingleLine(firstLine(JSON.stringify(args)), 240),
			options: "",
		};
	}

	const record = args as Record<string, unknown>;
	const mainParts = MAIN_FIELD_NAMES.map((fieldName) => record[fieldName])
		.filter(
			(value): value is string | number | boolean =>
				typeof value === "string" ||
				typeof value === "number" ||
				typeof value === "boolean",
		)
		.map(String)
		.filter(Boolean);
	const optionParts = OPTION_FIELD_NAMES.filter(
		(fieldName) => !MAIN_FIELD_NAMES.includes(fieldName),
	)
		.map((fieldName) => formatOptionField(fieldName, record[fieldName]))
		.filter(Boolean);

	const main =
		mainParts.length > 0 ? mainParts.join(" · ") : JSON.stringify(record);
	return {
		main: truncateSingleLine(firstLine(main), 240),
		options: optionParts.join(" "),
	};
}

/**
 * Formats one scalar option field for compact display.
 *
 * @param fieldName Object field name.
 * @param value Object field value.
 * @returns Compact field text or an empty string for unsupported values.
 */
function formatOptionField(fieldName: string, value: unknown): string {
	if (
		typeof value !== "string" &&
		typeof value !== "number" &&
		typeof value !== "boolean"
	)
		return "";
	if (value === "") return "";
	return `${fieldName}=${String(value)}`;
}
