import { getActiveRtkCwd } from "./runtimeStore";

/**
 * Resolves the best cwd for an RTK tool execution.
 *
 * @param ctx Tool execution context.
 * @returns Session cwd, active RTK cwd, or process cwd.
 */
export function getRtkExecutionCwd(ctx?: { cwd?: string }): string {
  if (typeof ctx?.cwd === "string" && ctx.cwd.length > 0) {
    return ctx.cwd;
  }

  return getActiveRtkCwd() ?? process.cwd();
}
