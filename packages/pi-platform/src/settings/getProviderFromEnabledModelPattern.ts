/**
 * Extracts a provider namespace from a provider-qualified enabled-model pattern.
 *
 * @param pattern Enabled-model pattern from settings.
 * @returns Provider id, or undefined for unqualified model patterns.
 */
export function getProviderFromEnabledModelPattern(pattern: string): string | undefined {
  const trimmedPattern = pattern.trim();
  const slashIndex = trimmedPattern.indexOf("/");
  if (slashIndex <= 0) return undefined;
  return trimmedPattern.slice(0, slashIndex);
}
