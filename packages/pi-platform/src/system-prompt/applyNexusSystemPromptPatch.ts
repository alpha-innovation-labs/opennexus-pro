import { buildNexusSystemPrompt } from "./buildNexusSystemPrompt.js";
import type { NexusSystemPromptOptions } from "./types.js";

type AgentSessionClass = {
	__nexusSystemPromptPatched__?: boolean;
	prototype: {
		_rebuildSystemPrompt: (this: AgentSessionInstance, toolNames: string[]) => string;
	};
};

type AgentSessionInstance = {
	_baseSystemPromptOptions?: NexusSystemPromptOptions;
};

/**
 * Patches Pi's AgentSession to use Nexus' Pi-compatible prompt without Pi docs.
 */
export async function applyNexusSystemPromptPatch(): Promise<void> {
	const agentSessionModule = await import("../../../../node_modules/@earendil-works/pi-coding-agent/dist/core/agent-session.js");
	const AgentSession = agentSessionModule.AgentSession as unknown as AgentSessionClass;
	if (AgentSession.__nexusSystemPromptPatched__) return;
	const originalRebuild = AgentSession.prototype._rebuildSystemPrompt;
	AgentSession.prototype._rebuildSystemPrompt = function rebuildNexusSystemPrompt(this: AgentSessionInstance, toolNames: string[]): string {
		originalRebuild.call(this, toolNames);
		return buildNexusSystemPrompt(this._baseSystemPromptOptions!);
	};
	AgentSession.__nexusSystemPromptPatched__ = true;
}
