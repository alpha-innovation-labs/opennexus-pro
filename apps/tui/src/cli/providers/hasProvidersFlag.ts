/**
 * Checks whether argv contains the provider command prefix.
 *
 * @param argv Raw CLI arguments.
 * @returns True when the first argument is "provider".
 */
export function hasProvidersFlag(argv: readonly string[]): boolean {
  return argv[0] === "provider";
}
