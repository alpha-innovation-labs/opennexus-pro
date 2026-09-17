import { type Static, Type } from "@earendil-works/pi-ai";
import {
	type AgentToolResult,
	defineTool,
	type ExtensionContext,
	type ToolDefinition,
} from "@earendil-works/pi-coding-agent";
import type { AgentProfile } from "../profile";
import type { RunManager } from "../run";

/**
 * The parent-side `launch` tool.
 *
 * Launches one or more subagent runs in a single call so all of them start before
 * any waiting begins. Each run is seeded, spawned, registered, watched, and wired
 * for delivery by the run manager; async runs return immediately (their result is
 * pushed by steer when the watcher settles) and blocking runs await and carry their
 * result inline.
 *
 * Target: context/extension/subagents/tool-surface.md (the launch tool).
 */

const AgentProfileParams = Type.Object({
	model: Type.Optional(
		Type.String({ description: "The model id the child runs on." }),
	),
	thinking: Type.Optional(
		Type.Union([Type.String(), Type.Number()], {
			description: "The thinking level or budget.",
		}),
	),
	tools: Type.Optional(
		Type.Array(Type.String(), {
			description: "Tool names the child may call.",
		}),
	),
	deny: Type.Optional(
		Type.Array(Type.String(), {
			description: "Tool names denied to the child.",
		}),
	),
	skills: Type.Optional(
		Type.Array(Type.String(), {
			description: "Skill names loaded into the child.",
		}),
	),
	inject: Type.Optional(
		Type.Array(Type.String(), {
			description: "Identity and system text injected into the child.",
		}),
	),
	env: Type.Optional(
		Type.Record(Type.String(), Type.String(), {
			description: "Environment variables for the child.",
		}),
	),
	cwd: Type.Optional(
		Type.String({ description: "The working directory the child starts in." }),
	),
	flags: Type.Optional(
		Type.Array(Type.String(), {
			description: "Raw flags appended to the child's argv.",
		}),
	),
});

const RunSpecParams = Type.Object({
	task: Type.String({
		description:
			"The task text. Required and non-empty: the child always has a prompt.",
	}),
	name: Type.Optional(
		Type.String({
			description: "Display name for lookup by name. Defaults to the run id.",
		}),
	),
	title: Type.Optional(
		Type.String({ description: "A human-readable title for the run." }),
	),
	agent: Type.Optional(AgentProfileParams),
	mode: Type.Optional(
		Type.Union(
			[
				Type.Literal("standalone"),
				Type.Literal("lineage-only"),
				Type.Literal("fork"),
			],
			{
				description:
					"The session mode the run's file is seeded in. Defaults to standalone.",
			},
		),
	),
	blocking: Type.Optional(
		Type.Boolean({
			description:
				"True for a blocking (sync) run: await and return the result inline.",
		}),
	),
	cwd: Type.Optional(
		Type.String({ description: "Working directory override for this run." }),
	),
});

const LaunchParams = Type.Object({
	runs: Type.Array(RunSpecParams, {
		description:
			"The runs to launch. A single run is a one-element array; multiple runs for one request are " +
			"launched in this single call so all of them start before any waiting begins.",
	}),
});

type LaunchParamsStatic = Static<typeof LaunchParams>;
type RunSpec = LaunchParamsStatic["runs"][number];

/** Render one launch outcome as a human-readable line for the tool result text. */
function outcomeLine(outcome: import("../run").LaunchOutcome): string {
	const label = `- ${outcome.name} (${outcome.runId}) [${outcome.delivery}]`;
	if (outcome.result === undefined) {
		return `${label} — started; the result arrives by steer when it finishes`;
	}
	const summary = outcome.result.summary ?? "(no summary)";
	return `${label} — ${outcome.result.status}: ${summary}`;
}

/**
 * Create the parent-side `launch` tool.
 *
 * `getRunManager` resolves the run manager for the current session (created lazily from
 * the first call's `ExtensionContext`, which carries the cwd the session directory is
 * derived from). The manager is shared by the launch, resume, and kill tools.
 */
export function createLaunchTool(
	getRunManager: (ctx: ExtensionContext) => RunManager,
): ToolDefinition<
	typeof LaunchParams,
	{ runs: import("../run").LaunchOutcome[] }
> {
	return defineTool({
		name: "subagents_launch",
		label: "Launch subagents",
		description:
			"Launch one or more subagent runs in a single call. Every run is started (seeded, spawned, " +
			"registered, watched) before any blocking run is awaited, so a multi-launch starts them all at " +
			"once. Async runs return immediately and push their result to you by steer when they finish; a " +
			"blocking run is awaited and returns its result inline. Use blocking for a run you need the " +
			"answer to right now; use the default (async) for runs you want to fan out.",
		parameters: LaunchParams,
		execute: async (
			_toolCallId: string,
			params: LaunchParamsStatic,
			_signal: AbortSignal | undefined,
			_onUpdate: undefined,
			ctx: ExtensionContext,
		): Promise<AgentToolResult<{ runs: import("../run").LaunchOutcome[] }>> => {
			const parentSession = ctx.sessionManager.getSessionFile() ?? undefined;
			const cwd = ctx.cwd;
			const manager = getRunManager(ctx);
			const requests: import("../run").LaunchRequest[] = params.runs.map(
				(spec: RunSpec) => ({
					task: spec.task,
					...(spec.name !== undefined ? { name: spec.name } : {}),
					...(spec.title !== undefined ? { title: spec.title } : {}),
					...(spec.agent !== undefined
						? { agent: { ...spec.agent } as AgentProfile }
						: {}),
					...(spec.mode !== undefined ? { mode: spec.mode } : {}),
					...(spec.blocking !== undefined ? { blocking: spec.blocking } : {}),
					...(spec.cwd !== undefined ? { cwd: spec.cwd } : {}),
				}),
			);
			const outcomes = await manager.launch(requests, {
				...(parentSession !== undefined ? { parentSession } : {}),
				...(cwd !== undefined ? { cwd } : {}),
			});
			const text = [
				`Launched ${outcomes.length} subagent run(s).`,
				...outcomes.map(outcomeLine),
			].join("\n");
			return {
				content: [{ type: "text", text }],
				details: { runs: outcomes },
			};
		},
	});
}
