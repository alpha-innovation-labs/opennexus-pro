/**
 * Combines optional FFF constraint fragments.
 *
 * @param parts Constraint fragments.
 * @returns Combined constraint query.
 */
export function combineConstraints(...parts: Array<string | undefined>): string | undefined {
  const combined = parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part));
  return combined.length > 0 ? combined.join(" ") : undefined;
}
