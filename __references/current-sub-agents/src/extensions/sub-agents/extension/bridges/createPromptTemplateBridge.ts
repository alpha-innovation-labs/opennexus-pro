import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { registerPromptTemplateDelegationBridge } from "../../vendor/prompt-template-bridge.js";
import type { SubagentState } from "../../vendor/types.js";

/**
 * Creates the prompt-template bridge bound to the current executor.
 *
 * @param pi Pi extension API.
 * @param state Mutable extension state.
 * @param execute Executor callback.
 * @returns Prompt-template bridge controls.
 */
export function createPromptTemplateBridge(
	pi: ExtensionAPI,
	state: SubagentState,
	execute: (id: string, params: unknown, signal: AbortSignal, onUpdate: unknown, ctx: ExtensionContext) => Promise<unknown>,
): { cancelAll: () => void; dispose: () => void } {
	return registerPromptTemplateDelegationBridge({
		events: pi.events,
		getContext: () => state.lastUiContext,
		execute: async (requestId, request, signal, ctx, onUpdate) => {
			if (request.tasks && request.tasks.length > 0) {
				return execute(requestId, {
					tasks: request.tasks,
					context: request.context,
					cwd: request.cwd,
					worktree: request.worktree,
					async: false,
					clarify: false,
				}, signal, onUpdate, ctx as ExtensionContext);
			}

			return execute(requestId, {
				agent: request.agent,
				task: request.task,
				context: request.context,
				cwd: request.cwd,
				model: request.model,
				async: false,
				clarify: false,
			}, signal, onUpdate, ctx as ExtensionContext);
		},
	});
}
