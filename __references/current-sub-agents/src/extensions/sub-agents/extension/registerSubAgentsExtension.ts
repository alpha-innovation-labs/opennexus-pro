import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { discoverAgents } from "../vendor/agents.js";
import { cleanupAllArtifactDirs, getArtifactsDir } from "../vendor/artifacts.js";
import { cleanupOldChainDirs } from "../vendor/settings.js";
import { createSubagentExecutor } from "../vendor/subagent-executor.js";
import { registerSlashCommands } from "../vendor/slash-commands.js";
import { resolveSlashMessageDetails, type SlashMessageDetails } from "../vendor/slash-live-state.js";
import { ASYNC_DIR, DEFAULT_ARTIFACT_CONFIG, RESULTS_DIR, SLASH_RESULT_TYPE } from "../vendor/types.js";
import { createAsyncRuntime } from "./async/createAsyncRuntime.js";
import { createPromptTemplateBridge } from "./bridges/createPromptTemplateBridge.js";
import { createSlashBridge } from "./bridges/createSlashBridge.js";
import { loadSubagentConfig } from "./config/loadSubagentConfig.js";
import { ensureAccessibleDir } from "./fs/ensureAccessibleDir.js";
import { registerSessionHandlers } from "./lifecycle/registerSessionHandlers.js";
import { registerToolResultHandler } from "./lifecycle/registerToolResultHandler.js";
import { expandTilde } from "./path/expandTilde.js";
import { getSubagentSessionRoot } from "./session/getSubagentSessionRoot.js";
import { createSlashResultComponent } from "./slash/createSlashResultComponent.js";
import { createInitialSubagentState } from "./state/createInitialSubagentState.js";
import { createStatusTool } from "./tools/createStatusTool.js";
import { createSubagentTool } from "./tools/createSubagentTool.js";

/**
 * Registers the refactored local subagents extension entrypoint.
 *
 * @param pi Pi extension API.
 */
export function registerSubAgentsExtension(pi: ExtensionAPI): void {
	ensureAccessibleDir(RESULTS_DIR);
	ensureAccessibleDir(ASYNC_DIR);
	cleanupOldChainDirs();

	const config = loadSubagentConfig();
	const asyncByDefault = config.asyncByDefault === true;
	const tempArtifactsDir = getArtifactsDir(null);
	cleanupAllArtifactDirs(DEFAULT_ARTIFACT_CONFIG.cleanupDays);

	const state = createInitialSubagentState();
	const { stopResultWatcher, ensurePoller, resetJobs, handleStarted, handleComplete } = createAsyncRuntime(pi, state);
	const executor = createSubagentExecutor({
		pi,
		state,
		config,
		asyncByDefault,
		tempArtifactsDir,
		getSubagentSessionRoot,
		expandTilde,
		discoverAgents,
	});

	pi.registerMessageRenderer<SlashMessageDetails>(SLASH_RESULT_TYPE, (message, options, theme) => {
		const details = resolveSlashMessageDetails(message.details);
		if (!details) return undefined;
		return createSlashResultComponent(details, options, theme);
	});

	const slashBridge = createSlashBridge(pi, state, (id, params, signal, onUpdate, ctx) =>
		executor.execute(id, params as never, signal, onUpdate as never, ctx),
	);
	const promptTemplateBridge = createPromptTemplateBridge(pi, state, (id, params, signal, onUpdate, ctx) =>
		executor.execute(id, params as never, signal, onUpdate as never, ctx),
	);

	pi.registerTool(createSubagentTool((id, params, signal, onUpdate, ctx) => executor.execute(id, params, signal, onUpdate, ctx)));
	pi.registerTool(createStatusTool());
	registerSlashCommands(pi, state);
	pi.events.on("subagent:started", handleStarted);
	pi.events.on("subagent:complete", handleComplete);
	registerToolResultHandler(pi, state, ensurePoller);
	registerSessionHandlers(pi, state, resetJobs, stopResultWatcher, slashBridge, promptTemplateBridge);
}

export default registerSubAgentsExtension;
