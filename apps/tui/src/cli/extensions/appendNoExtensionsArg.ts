import { hasNoExtensionsFlag } from "./hasNoExtensionsFlag";

/**
 * Appends the canonical no-extensions flag when argv does not already disable extensions.
 *
 * @param argv Command-line arguments to normalize.
 * @returns Args guaranteed to contain a no-extensions flag.
 */
export function appendNoExtensionsArg(argv: string[]): string[] {
  if (hasNoExtensionsFlag(argv)) {
    return [...argv];
  }

  return ["--no-extensions", ...argv];
}
