/**
 * Formats one labeled session count.
 *
 * @param label Count label.
 * @param value Count value.
 * @returns Human-readable count line.
 */
export function formatSessionCount(label: string, value: number): string {
	return `${label}: ${value}`;
}
