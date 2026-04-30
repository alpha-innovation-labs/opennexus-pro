/**
 * Formats distilled knowledge as one line capped at 240 characters.
 *
 * @param value Distilled markdown or prose.
 * @returns Single-line distillation.
 */
export function formatSingleLineDistillation(value: string): string {
	const line = value.replace(/\s+/g, " ").trim();
	return line.length <= 240 ? line : `${line.slice(0, 239)}…`;
}
