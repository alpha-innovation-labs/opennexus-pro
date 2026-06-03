/**
 * Detects the top-level steering CLI command.
 *
 * @param argv Raw CLI arguments.
 * @returns True when argv starts with the steer command.
 */
export function isSteerCommand(argv: readonly string[]): boolean {
  return argv[0] === "steer";
}
