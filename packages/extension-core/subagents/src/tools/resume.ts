import { type Static, Type } from "@earendil-works/pi-ai";
import {
	type AgentToolResult,
	defineTool,
	type ExtensionContext,
	type ToolDefinition,
} from "@earendil-works/pi-coding-agent";
import type { RunManager } from "../run";
import type { SessionMode } from "../session";

/**
 * The parent-side `resume` tool.
 *
 * Re-spawns an ended or paused run from its session file. The run manager resolves
 * the original run from the registry, re-spawns the child by the lifecycle layer
 * (which re-derives the session state from the file and resolves the launch
 * configuration), and registers the fresh run. The fresh run starts async and its
 * result is pushed by the watcher on settlement.
 *
 * Target: context/extension/subagents/tool-surface.md (the resume tool).
 */

const ResumeParams = Type.Object({
	idOrName: Type.String({
		description: "The run id or display name to resume.",
	}),
	mode: Type.Optional(
		Type.Union(
			[
				Type.Literal("standalone"),
				Type.Literal("lineage-only"),
				Type.Literal("fork"),
			],
			{
				description:
					"The last-resort session mode the resumed run rebuilds from, used only when no launch " +
					"metadata is recorded. Defaults to the run's own recorded mode.",
			},
		),
	),
	resumeTask: Type.Optional(
		Type.String({
			description:
				"An optional new prompt for the resumed run (the original task is in the file).",
		}),
	),
	cwd: Type.Optional(
		Type.String({
			description: "Working directory override for the resumed run.",
		}),
	),
});

type ResumeParamsStatic = Static<typeof ResumeParams>;

/**
 * Create the parent-side `resume` tool.
 *
 * `getRunManager` resolves the run manager for the current session (created lazily
 * from the first call's `ExtensionContext`). The manager is shared by the launch,
 * resume, and kill tools.
 */
export function createResumeTool(
	getRunManager: (ctx: ExtensionContext) => RunManager,
): ToolDefinition<
	typeof ResumeParams,
	{
		runId: string;
		name: string;
		sessionPath: string;
		source: "child-file" | "parent-entries" | "explicit-mode";
		started: true;
	}
> {
	return defineTool({
		name: "subagents_resume",
		label: "Resume subagent",
		description:
			"Re-spawn an ended or paused subagent run from its session file. The run's conversation is " +
			"durable in the file, so the fresh run continues from where the run left off. The launch " +
			"configuration is re-read from the run's recorded launch entry (or, failing that, from the " +
			"parent's launch record or the supplied mode). Returns immediately; the run's result is " +
			"pushed by steer when it finishes.",
		parameters: ResumeParams,
		execute: async (
			_toolCallId: string,
			params: ResumeParamsStatic,
			_signal: AbortSignal | undefined,
			_onUpdate: undefined,
			ctx: ExtensionContext,
		): Promise<
			AgentToolResult<{
				runId: string;
				name: string;
				sessionPath: string;
				source: "child-file" | "parent-entries" | "explicit-mode";
				started: true;
			}>
		> => {
			const parentSession = ctx.sessionManager.getSessionFile() ?? undefined;
			const manager = getRunManager(ctx);
			const outcome = await manager.resume(
				params.idOrName,
				{
					...(params.mode !== undefined
						? { mode: params.mode as SessionMode }
						: {}),
					...(params.resumeTask !== undefined
						? { resumeTask: params.resumeTask }
						: {}),
					...(params.cwd !== undefined ? { cwd: params.cwd } : {}),
				},
				{
					...(parentSession !== undefined ? { parentSession } : {}),
					...(ctx.cwd !== undefined ? { cwd: ctx.cwd } : {}),
				},
			);
			const text =
				`Resumed subagent ${outcome.name} (${outcome.runId}) from its session file ` +
				`(launch configuration source: ${outcome.source}). It started; the result arrives by steer when it finishes.`;
			return {
				content: [{ type: "text", text }],
				details: {
					runId: outcome.runId,
					name: outcome.name,
					sessionPath: outcome.sessionPath,
					source: outcome.source,
					started: true,
				},
			};
		},
	});
}
