import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { SessionManager } from "@earendil-works/pi-coding-agent";
import type { ResumeScope } from "./ResumeScope.js";

export type ResumeSessionInfo = {
  path: string;
  name?: string;
  cwd?: string;
  modified: Date;
};

/**
 * Lists resumable sessions for the selected resume menu source.
 *
 * @param ctx Extension context.
 * @param scope Active resume source.
 * @returns Resumable session infos.
 */
export async function listResumeSessions(ctx: ExtensionContext, scope: ResumeScope): Promise<ResumeSessionInfo[]> {
  if (scope === "all") return SessionManager.listAll() as Promise<ResumeSessionInfo[]>;
  return SessionManager.list(ctx.cwd, ctx.sessionManager.getSessionDir()) as Promise<ResumeSessionInfo[]>;
}
