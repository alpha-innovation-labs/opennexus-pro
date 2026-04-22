/**
 * Quotes one shell argument for safe use in a bash command string.
 *
 * @param value Raw argument.
 * @returns Shell-escaped argument.
 */
export function quoteShellArg(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}
