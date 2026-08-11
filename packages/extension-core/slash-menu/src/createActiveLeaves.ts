import type {
	ExtensionAPI,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { getRegisteredToolRecords } from "@nexus/feature-flags/index";
import { createBuiltinToolLeaves } from "./createBuiltinToolLeaves";
import { createForkLeaves } from "./createForkLeaves";
import { createLogoutProviderLeaves } from "./createLogoutProviderLeaves";
import { createModelLeaves } from "./createModelLeaves";
import { createRecordedToolLeaves } from "./createRecordedToolLeaves";
import { createResumeLeaves } from "./createResumeLeaves";
import { createScopedModelLeaves } from "./createScopedModelLeaves";
import { createSettingsLeaves } from "./createSettingsLeaves";
import { createSourceCommandLeaves } from "./createSourceCommandLeaves";
import { createThemeLeaves } from "./createThemeLeaves";
import { createToolLeaves } from "./createToolLeaves";
import { filterResourceCommandsByScope } from "./filterResourceCommandsByScope";
import type { ResourceCommandScope } from "./ResourceCommandScope";
import { listResumeSessions } from "./resume-scope/listResumeSessions";
import type { ResumeScope } from "./resume-scope/ResumeScope";
import type { SlashMenuLevel } from "./SlashMenuLevel";
import type { RegisteredSlashCommand, SlashMenuLeaf } from "./types";

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
	if (level === "settings")
		return createSettingsLeaves(ctx.cwd, getThinkingLevel(), ctx.model);
	if (level === "theme") return createThemeLeaves(ctx.cwd);
	if (level === "model") return createModelLeaves(ctx);
	if (level === "scoped-models") return createScopedModelLeaves(ctx);
	if (level === "fork")
		return createForkLeaves(ctx.sessionManager.getEntries() as never);
	if (level === "resume")
		return createResumeLeaves(await listResumeSessions(ctx, resumeScope));
	if (level === "logout") return createLogoutProviderLeaves(ctx);
	if (level === "prompts")
		return createSourceCommandLeaves(
			filterResourceCommandsByScope(dynamicCommands, resourceScope),
			"prompt",
		);
	if (level === "skills")
		return createSourceCommandLeaves(
			filterResourceCommandsByScope(dynamicCommands, resourceScope),
			"skill",
		);
	if (level === "tools") {
		const builtinLeaves = await createBuiltinToolLeaves(ctx.cwd);
		const recordedLeaves = createRecordedToolLeaves(getRegisteredToolRecords());
		return createToolLeaves(tools, [...builtinLeaves, ...recordedLeaves]);
	}
	return [];
}
