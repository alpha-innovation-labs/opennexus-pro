/**
 * Replaces {{variable}} tokens in a configured terminal string.
 *
 * @param value Configured string value.
 * @param variables Terminal variable dictionary.
 * @returns Resolved string.
 */
export function resolveTermVariables(value: string, variables: Record<string, string>): string {
	return value.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match: string, name: string) => variables[name] ?? match);
}
