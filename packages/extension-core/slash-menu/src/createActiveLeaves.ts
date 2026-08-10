import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getRegisteredToolRecords } from "@nexus/feature-flags/index.js";
import { createForkLeaves } from "./createForkLeaves.js";
import { createLogoutProviderLeaves } from "./createLogoutProviderLeaves.js";
import { createBuiltinToolLeaves } from "./createBuiltinToolLeaves.js";
import { createModelLeaves } from "./createModelLeaves.js";
import { createRecordedToolLeaves } from "./createRecordedToolLeaves.js";
import { createResumeLeaves } from "./createResumeLeaves.js";
import { createScopedModelLeaves } from "./createScopedModelLeaves.js";
import { createSettingsLeaves } from "./createSettingsLeaves.js";
import { createSourceCommandLeaves } from "./createSourceCommandLeaves.js";
import { filterResourceCommandsByScope } from "./filterResourceCommandsByScope.js";
import { createThemeLeaves } from "./createThemeLeaves.js";
import { createToolLeaves } from "./createToolLeaves.js";
import { listResumeSessions } from "./resume-scope/listResumeSessions.js";
import type { ResumeScope } from "./resume-scope/ResumeScope.js";
import type { ResourceCommandScope } from "./ResourceCommandScope.js";
import type { SlashMenuLevel } from "./SlashMenuLevel.js";
import type { RegisteredSlashCommand, SlashMenuLeaf } from "./types.js";

type ToolInfo = ReturnType<ExtensionAPI["getAllTools"]>[number];

/**
 * Builds the active leaf list for one slash-menu level.
 *
 * @param ctx Extension context.
 * @param level Current menu level.
 * @param getThinkingLevel Current thinking-level getter.
 * @param resumeScope Resume list scope.
 * @param dynamicCommands Live prompt and skill commands.
 * @param resourceScope Active resource scope filter.
 * @param tools Live available tool metadata.
 * @returns Menu leaves for the level.
 */
export async function createActiveLeaves(
  ctx: ExtensionContext,
  level: SlashMenuLevel,
  getThinkingLevel: () => string,
  resumeScope: ResumeScope = "all",
  dynamicCommands: RegisteredSlashCommand[] = [],
  resourceScope: ResourceCommandScope = "all",
  tools: ToolInfo[] = [],
): Promise<SlashMenuLeaf[]> {
  if (level === "settings") return createSettingsLeaves(ctx.cwd, getThinkingLevel(), ctx.model);
  if (level === "theme") return createThemeLeaves(ctx.cwd);
  if (level === "model") return createModelLeaves(ctx);
  if (level === "scoped-models") return createScopedModelLeaves(ctx);
  if (level === "fork") return createForkLeaves(ctx.sessionManager.getEntries() as never);
  if (level === "resume") return createResumeLeaves(await listResumeSessions(ctx, resumeScope));
  if (level === "logout") return createLogoutProviderLeaves(ctx);
  if (level === "prompts") return createSourceCommandLeaves(filterResourceCommandsByScope(dynamicCommands, resourceScope), "prompt");
  if (level === "skills") return createSourceCommandLeaves(filterResourceCommandsByScope(dynamicCommands, resourceScope), "skill");
  if (level === "tools") {
    const builtinLeaves = await createBuiltinToolLeaves(ctx.cwd);
    const recordedLeaves = createRecordedToolLeaves(getRegisteredToolRecords());
    return createToolLeaves(tools, [...builtinLeaves, ...recordedLeaves]);
  }
  return [];
}
