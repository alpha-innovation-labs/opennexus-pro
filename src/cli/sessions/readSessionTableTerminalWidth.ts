/**
 * Reads the current stdout terminal width for responsive session table rendering.
 *
 * @returns Terminal width in columns when stdout is attached to a sized terminal.
 */
export function readSessionTableTerminalWidth(): number | undefined {
  return typeof process.stdout.columns === "number" && process.stdout.columns > 0 ? process.stdout.columns : undefined;
}
