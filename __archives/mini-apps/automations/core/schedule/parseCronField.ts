/**
 * Parses one cron field into allowed numeric values.
 *
 * @param field Cron field text.
 * @param min Minimum allowed value.
 * @param max Maximum allowed value.
 * @returns Allowed numeric values.
 */
export function parseCronField(field: string, min: number, max: number): Set<number> {
	const values = new Set<number>();
	for (const part of field.split(",")) {
		addCronPart(values, part.trim(), min, max);
	}
	return values;
}

/**
 * Adds values from one cron part to a set.
 *
 * @param values Destination value set.
 * @param part Cron field segment.
 * @param min Minimum allowed value.
 * @param max Maximum allowed value.
 */
function addCronPart(values: Set<number>, part: string, min: number, max: number): void {
	const [rangePart, stepPart] = part.split("/");
	const step = stepPart ? Number(stepPart) : 1;
	const [start, end] = rangePart === "*" ? [min, max] : rangePart.split("-").map(Number);
	for (let value = start; value <= (end ?? start); value += step) {
		if (!Number.isInteger(value) || value < min || value > max) throw new Error(`Invalid cron field: ${part}`);
		values.add(value);
	}
}
