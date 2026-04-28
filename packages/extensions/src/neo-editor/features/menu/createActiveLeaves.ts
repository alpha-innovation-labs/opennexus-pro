import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createForkLeaves } from "./createForkLeaves.js";
import { createModelLeaves } from "./createModelLeaves.js";
import { createOAuthProviderLeaves } from "./createOAuthProviderLeaves.js";
import { createResumeLeaves } from "./createResumeLeaves.js";
import { createScopedModelLeaves } from "./createScopedModelLeaves.js";
import { createSettingsLeaves } from "./createSettingsLeaves.js";
import { createSourceCommandLeaves } from "./createSourceCommandLeaves.js";
import { createThemeLeaves } from "./createThemeLeaves.js";
import { createTreeLeaves } from "./createTreeLeaves.js";
import { createTreeSummaryLeaves } from "./createTreeSummaryLeaves.js";
import { listResumeSessions } from "./resume-scope/listResumeSessions.js";
import type { ResumeScope } from "./resume-scope/ResumeScope.js";
import type { SlashMenuLevel } from "./SlashMenuLevel.js";
import type { RegisteredSlashCommand, SlashMenuLeaf } from "./types.js";

/**
 * Builds the active leaf list for one slash-menu level.
 *
 * @param ctx Extension context.
 * @param level Current menu level.
 * @param getThinkingLevel Current thinking-level getter.
 * @param expandedTreeUserIds Expanded session-tree user ids.
 * @param resumeScope Resume list scope.
 * @param dynamicCommands Live prompt and skill commands.
 * @returns Menu leaves for the level.
 */
export async function createActiveLeaves(
  ctx: ExtensionContext,
  level: SlashMenuLevel,
  getThinkingLevel: () => string,
  expandedTreeUserIds: ReadonlySet<string> = new Set(),
  resumeScope: ResumeScope = "all",
  dynamicCommands: RegisteredSlashCommand[] = [],
): Promise<SlashMenuLeaf[]> {
  if (level === "settings") return createSettingsLeaves(ctx.cwd, getThinkingLevel(), ctx.model);
  if (level === "theme") return createThemeLeaves(ctx.cwd);
  if (level === "model") return createModelLeaves(ctx);
  if (level === "scoped-models") return createScopedModelLeaves(ctx);
  if (level === "fork") return createForkLeaves(ctx.sessionManager.getEntries() as never);
  if (level === "tree") return createTreeLeaves(ctx.sessionManager.getTree() as never, expandedTreeUserIds, ctx.ui.theme);
  if (level === "tree-summary") return createTreeSummaryLeaves();
  if (level === "resume") return createResumeLeaves(await listResumeSessions(ctx, resumeScope));
  if (level === "login") return createOAuthProviderLeaves(ctx, "login");
  if (level === "logout") return createOAuthProviderLeaves(ctx, "logout");
  if (level === "prompts") return createSourceCommandLeaves(dynamicCommands, "prompt");
  if (level === "skills") return createSourceCommandLeaves(dynamicCommands, "skill");
  return [];
}
