import { getProviderFromEnabledModelPattern } from "./getProviderFromEnabledModelPattern.js";

export type ProviderAuthStatusReader = {
  hasAuth: (provider: string) => boolean;
};

/**
 * Filters provider-qualified enabled-model patterns to providers with configured auth.
 *
 * @param patterns Enabled-model patterns from settings.
 * @param authStorage Auth status reader.
 * @returns Filtered patterns, or undefined when no explicit scope remains.
 */
export function filterLoggedInEnabledModelPatterns(
  patterns: string[] | undefined,
  authStorage: ProviderAuthStatusReader,
): string[] | undefined {
  if (!patterns) return undefined;
  const filteredPatterns = patterns.filter((pattern) => isEnabledModelPatternAvailable(pattern, authStorage));
  return filteredPatterns.length > 0 ? filteredPatterns : undefined;
}

/**
 * Checks whether one enabled-model pattern should remain after auth cleanup.
 *
 * @param pattern Enabled-model pattern from settings.
 * @param authStorage Auth status reader.
 * @returns True when the pattern is unqualified or its provider has configured auth.
 */
function isEnabledModelPatternAvailable(pattern: string, authStorage: ProviderAuthStatusReader): boolean {
  const provider = getProviderFromEnabledModelPattern(pattern);
  return provider === undefined || authStorage.hasAuth(provider);
}
