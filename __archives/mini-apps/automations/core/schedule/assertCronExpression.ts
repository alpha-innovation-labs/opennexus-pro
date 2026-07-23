import { parseCronField } from "./parseCronField.js";

/**
 * Validates a five-field cron expression.
 *
 * @param cronExpression Cron expression to validate.
 */
export function assertCronExpression(cronExpression: string): void {
	const fields = cronExpression.trim().split(/\s+/u);
	if (fields.length !== 5) throw new Error("Cron schedule must have five fields");
	parseCronField(fields[0], 0, 59);
	parseCronField(fields[1], 0, 23);
	parseCronField(fields[2], 1, 31);
	parseCronField(fields[3], 1, 12);
	parseCronField(fields[4], 0, 7);
}
