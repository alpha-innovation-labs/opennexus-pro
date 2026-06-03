import type { SessionInfo } from "@earendil-works/pi-coding-agent";
import { matchesObservationRecreateSessionTarget } from "./matchesObservationRecreateSessionTarget.js";

/**
 * Selects sessions to recreate observations for.
 *
 * @param sessions Available sessions.
 * @param target `all`, an exact id, or a unique id prefix.
 * @returns Matching sessions, or an error message.
 */
export function selectObservationRecreateSessions(
  sessions: readonly SessionInfo[],
  target: string,
): { sessions: SessionInfo[] } | { error: string } {
  if (target === "all") return { sessions: [...sessions] };
  const exactMatches = sessions.filter((session) => matchesObservationRecreateSessionTarget(session, target, true));
  const matches = exactMatches.length > 0 ? exactMatches : sessions.filter((session) => matchesObservationRecreateSessionTarget(session, target, false));
  if (matches.length === 0) return { error: `No session found matching '${target}'` };
  if (matches.length > 1) return { error: `Multiple sessions match '${target}'. Use a longer session id.` };
  return { sessions: [matches[0]!] };
}
