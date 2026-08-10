import { hasMinimalFlag } from "./hasMinimalFlag";

/**
 * Appends the canonical minimal flag when argv does not already use minimal mode.
 *
 * @param argv Command-line arguments to normalize.
 * @returns Args guaranteed to contain a minimal flag.
 */
export function appendMinimalArg(argv: string[]): string[] {
  if (hasMinimalFlag(argv)) {
    return [...argv];
  }

  return ["--minimal", ...argv];
}
