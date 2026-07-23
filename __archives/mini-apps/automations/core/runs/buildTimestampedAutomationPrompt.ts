/**
 * Prefixes an automation prompt with the timestamp for this execution.
 *
 * @param timestamp Automation execution timestamp.
 * @param prompt Stored automation prompt text.
 * @returns Prompt text passed to Nexus for this run.
 */
export function buildTimestampedAutomationPrompt(timestamp: string, prompt: string): string {
	return `${timestamp} -- ${prompt}`;
}
