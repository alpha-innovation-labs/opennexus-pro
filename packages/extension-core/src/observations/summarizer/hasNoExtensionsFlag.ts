const NO_EXTENSIONS_FLAGS = new Set(["--no-extensions", "-ne"]);

/**
 * Reports whether argv explicitly disables extensions.
 *
 * @param argv Command-line arguments to inspect.
 * @returns True when the no-extensions flag is present.
 */
export function hasNoExtensionsFlag(argv: string[]): boolean {
  return argv.some((arg) => NO_EXTENSIONS_FLAGS.has(arg));
}
