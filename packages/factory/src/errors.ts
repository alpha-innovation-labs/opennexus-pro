import type { ValidationError } from "./types.ts";

/**
 * Checks whether a validation result has any errors.
 */
export function hasErrors(errors: ValidationError[]): boolean {
	return errors.length > 0;
}

/**
 * Formats validation errors into a human-readable string.
 */
export function formatErrors(errors: ValidationError[]): string {
	if (errors.length === 0) {
		return "✓ No validation errors.";
	}

	const lines: string[] = [`Found ${errors.length} validation error(s):`];
	for (const err of errors) {
		lines.push(`  ${err.path}: ${err.message} [${err.code}]`);
	}
	return lines.join("\n");
}

/**
 * Returns errors grouped by their code.
 */
export function groupByCode(errors: ValidationError[]): Record<string, ValidationError[]> {
	const groups: Record<string, ValidationError[]> = {};
	for (const err of errors) {
		if (!groups[err.code]) {
			groups[err.code] = [];
		}
		groups[err.code].push(err);
	}
	return groups;
}
