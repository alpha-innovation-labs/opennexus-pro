import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { Details, ExtensionConfig, SubagentState } from "../vendor/types.js";

/**
 * Adds the optional error flag used by the upstream subagents renderer.
 */
export type SubagentToolResult = AgentToolResult<Details> & {
	isError?: boolean;
};

/**
 * Shared runtime values used by the local subagents extension entrypoint.
 */
export type SubagentExtensionRuntime = {
	config: ExtensionConfig;
	asyncByDefault: boolean;
	tempArtifactsDir: string;
	state: SubagentState;
	stopResultWatcher: () => void;
	ensurePoller: () => void;
	resetJobs: (ctx: ExtensionContext) => void;
	handleStarted: (payload: unknown) => void;
	handleComplete: (payload: unknown) => void;
	slashBridge: {
		cancelAll: () => void;
		dispose: () => void;
	};
	promptTemplateBridge: {
		cancelAll: () => void;
		dispose: () => void;
	};
};
