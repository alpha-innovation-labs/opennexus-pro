import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { SessionManager } from "../../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/session-manager.js";
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
