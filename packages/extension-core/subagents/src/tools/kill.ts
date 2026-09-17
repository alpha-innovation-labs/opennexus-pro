import { type Static, Type } from "@earendil-works/pi-ai";
import {
	type AgentToolResult,
	defineTool,
	type ExtensionContext,
	type ToolDefinition,
} from "@earendil-works/pi-coding-agent";
import type { RunManager } from "../run";

/**
 * The parent-side `kill` tool.
 *
 * Stops a live run. The stop funnels into the completion machinery: the run manager
 * aborts the run's watcher, the lifecycle stop marks the run stopped and signals its
 * process group, and the watcher's exit handler classifies the terminal state and
 * settles the run's completion, which the delivery machinery pushes to the parent.
 * Both stop paths (this one, and the child's `done`) end in the same classification.
 *
 * Target: context/extension/subagents/tool-surface.md (the kill tool).
 */

const KillParams = Type.Object({
	idOrName: Type.String({ description: "The run id or display name to stop." }),
	reason: Type.Optional(
		Type.String({
			description: "A short reason for the stop, recorded on the run.",
		}),
	),
});

type KillParamsStatic = Static<typeof KillParams>;

/**
 * Create the parent-side `kill` tool.
 *
 * `getRunManager` resolves the run manager for the current session (created lazily
 * from the first call's `ExtensionContext`). The manager is shared by the launch,
 * resume, and kill tools.
 */
export function createKillTool(
	getRunManager: (ctx: ExtensionContext) => RunManager,
): ToolDefinition<
	typeof KillParams,
	{
		runId: string;
		name: string;
		stopped: boolean;
		group: {
			signal: string;
			alreadyGone: boolean;
			escalated: boolean;
			stillAlive: boolean;
		};
		note: string;
	}
> {
	return defineTool({
		name: "subagents_kill",
		label: "Kill subagent",
		description:
			"Stop a live subagent run. The run's watcher is aborted and its process group is signalled; " +
			"the watcher's exit handler classifies the terminal state and settles the run's completion, " +
			"so the stop funnels into the same delivery as a finished run (the result is pushed by steer " +
			"as cancelled, or as completed when the run had already produced a real answer).",
		parameters: KillParams,
		execute: async (
			_toolCallId: string,
			params: KillParamsStatic,
			_signal: AbortSignal | undefined,
			_onUpdate: undefined,
			ctx: ExtensionContext,
		): Promise<
			AgentToolResult<{
				runId: string;
				name: string;
				stopped: boolean;
				group: {
					signal: string;
					alreadyGone: boolean;
					escalated: boolean;
					stillAlive: boolean;
				};
				note: string;
			}>
		> => {
			const manager = getRunManager(ctx);
			const outcome = await manager.kill(params.idOrName, params.reason);
			const text = [
				`Stopped subagent ${outcome.name} (${outcome.runId}).`,
				`Process group: signal ${outcome.group.signal}; escalated=${outcome.group.escalated}; ` +
					`stillAlive=${outcome.group.stillAlive}.`,
				outcome.note,
			].join("\n");
			return {
				content: [{ type: "text", text }],
				details: {
					runId: outcome.runId,
					name: outcome.name,
					stopped: outcome.stopped,
					group: outcome.group,
					note: outcome.note,
				},
			};
		},
	});
}
