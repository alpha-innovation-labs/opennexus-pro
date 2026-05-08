import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createForkLeaves } from "./createForkLeaves.js";
import { createLoginImportLeaves } from "./createLoginImportLeaves.js";
import { createLoginLeaves } from "./createLoginLeaves.js";
import { createLoginProviderLeaves } from "./createLoginProviderLeaves.js";
import { createLogoutProviderLeaves } from "./createLogoutProviderLeaves.js";
import { createModelLeaves } from "./createModelLeaves.js";
import { createOAuthProviderLeaves } from "./createOAuthProviderLeaves.js";
import { createResumeLeaves } from "./createResumeLeaves.js";
import { createScopedModelLeaves } from "./createScopedModelLeaves.js";
import { createSettingsLeaves } from "./createSettingsLeaves.js";
import { createSourceCommandLeaves } from "./createSourceCommandLeaves.js";
import { filterResourceCommandsByScope } from "./filterResourceCommandsByScope.js";
import { createThemeLeaves } from "./createThemeLeaves.js";
import { listResumeSessions } from "./resume-scope/listResumeSessions.js";
import type { ResumeScope } from "./resume-scope/ResumeScope.js";
import type { ResourceCommandScope } from "./ResourceCommandScope.js";
import type { SlashMenuLevel } from "./SlashMenuLevel.js";
import type { RegisteredSlashCommand, SlashMenuLeaf } from "./types.js";

/**
 * Builds the active leaf list for one slash-menu level.
 *
 * @param ctx Extension context.
 * @param level Current menu level.
 * @param getThinkingLevel Current thinking-level getter.
 * @param resumeScope Resume list scope.
 * @param dynamicCommands Live prompt and skill commands.
 * @param resourceScope Active resource scope filter.
 * @returns Menu leaves for the level.
 */
export async function createActiveLeaves(
  ctx: ExtensionContext,
  level: SlashMenuLevel,
  getThinkingLevel: () => string,
  resumeScope: ResumeScope = "all",
  dynamicCommands: RegisteredSlashCommand[] = [],
  resourceScope: ResourceCommandScope = "all",
): Promise<SlashMenuLeaf[]> {
  if (level === "settings") return createSettingsLeaves(ctx.cwd, getThinkingLevel(), ctx.model);
  if (level === "theme") return createThemeLeaves(ctx.cwd);
  if (level === "model") return createModelLeaves(ctx);
  if (level === "scoped-models") return createScopedModelLeaves(ctx);
  if (level === "fork") return createForkLeaves(ctx.sessionManager.getEntries() as never);
  if (level === "resume") return createResumeLeaves(await listResumeSessions(ctx, resumeScope));
  if (level === "login") return createLoginLeaves(ctx);
  if (level === "login-import") return createLoginImportLeaves();
  if (level === "login-providers") return createLoginProviderLeaves(ctx);
  if (level === "logout") return createLogoutProviderLeaves(ctx);
  if (level === "prompts") return createSourceCommandLeaves(filterResourceCommandsByScope(dynamicCommands, resourceScope), "prompt");
  if (level === "skills") return createSourceCommandLeaves(filterResourceCommandsByScope(dynamicCommands, resourceScope), "skill");
  return [];
}
