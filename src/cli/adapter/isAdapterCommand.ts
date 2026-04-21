/**
 * Reports whether the argv targets the adapter command surface.
 *
 * @param argv Raw CLI args.
 * @returns True when the adapter subcommand is addressed.
 */
export function isAdapterCommand(argv: string[]): boolean {
  return argv[0] === "adapter";
}
