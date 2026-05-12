import type { SessionInfo } from "@earendil-works/pi-coding-agent";

export type DeleteSessionResolveResult =
  | { type: "found"; session: SessionInfo }
  | { type: "not_found"; sessionReference: string }
  | { type: "ambiguous"; sessionReference: string; matches: SessionInfo[] };
