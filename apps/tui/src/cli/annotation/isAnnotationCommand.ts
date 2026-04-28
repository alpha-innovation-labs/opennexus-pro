/**
 * Reports whether argv targets the annotation daemon command surface.
 *
 * @param argv Raw CLI args.
 * @returns True when the annotation subcommand is addressed.
 */
export function isAnnotationCommand(argv: readonly string[]): boolean {
  return argv[0] === "annotation";
}
