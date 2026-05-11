/**
 * Extracts a slash command name from raw user input without arguments.
 *
 * @param text Raw input text.
 * @returns Slash command name without the leading slash.
 */
export function getInputCommandName(text: string): string | undefined {
  const trimmed = text.trim();
  if (!trimmed.startsWith("/")) return undefined;
  const command = trimmed.slice(1).split(/\s+/u)[0]?.trim();
  return command ? command.slice(0, 80) : undefined;
}
