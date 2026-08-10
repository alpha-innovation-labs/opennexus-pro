import type { DeleteSessionMatch } from "./DeleteSessionMatch";

/**
 * Formats a diagnostic for an ambiguous delete-session reference.
 *
 * @param sessionReference Session ID prefix provided by the user.
 * @param matches Matching sessions that need disambiguation.
 * @returns Human-readable error message.
 */
export function formatAmbiguousDeleteSessionMessage(sessionReference: string, matches: readonly DeleteSessionMatch[]): string {
  const ids = matches.map((session) => `  ${session.id}  ${session.path}`).join("\n");
  return `Multiple sessions match '${sessionReference}'. Use a longer session ID.\n${ids}`;
}
