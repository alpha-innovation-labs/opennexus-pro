import { Text } from "@mariozechner/pi-tui";
import type { ToolDefinition } from "@mariozechner/pi-coding-agent";
import { renderSubagentResult } from "../../vendor/render.js";
import { SubagentParams } from "../../vendor/schemas.js";
import type { Details } from "../../vendor/types.js";
import { effectiveParallelTaskCount } from "./effectiveParallelTaskCount.js";

/**
 * Creates the main `subagent` tool definition.
 *
 * @param execute Executor callback.
 * @returns The configured tool definition.
 */
export function createSubagentTool(
	execute: ToolDefinition<typeof SubagentParams, Details>["execute"],
): ToolDefinition<typeof SubagentParams, Details> {
	return {
		name: "subagent",
		label: "Subagent",
		description: `Delegate to subagents or manage agent definitions.

EXECUTION (use exactly ONE mode):
• SINGLE: { agent, task } - one task
• CHAIN: { chain: [{agent:"scout"}, {parallel:[{agent:"worker",count:3}]}] } - sequential pipeline with optional parallel fan-out
• PARALLEL: { tasks: [{agent,task,count?}, ...], concurrency?: number, worktree?: true } - concurrent execution (worktree: isolate each task in a git worktree)
• Optional context: { context: "fresh" | "fork" } (default: "fresh")

CHAIN TEMPLATE VARIABLES (use in task strings):
• {task} - The original task/request from the user
• {previous} - Text response from the previous step (empty for first step)
• {chain_dir} - Shared directory for chain files (e.g., <tmpdir>/pi-subagents-<scope>/chain-runs/abc123/)

Example: { chain: [{agent:"scout", task:"Analyze {task}"}, {agent:"planner", task:"Plan based on {previous}"}] }

MANAGEMENT (use action field, omit agent/task/chain/tasks):
• { action: "list" } - discover agents/chains
• { action: "get", agent: "name" } - full agent detail
• { action: "create", config: { name, systemPrompt, systemPromptMode, inheritProjectContext, inheritSkills, ... } }
• { action: "update", agent: "name", config: { ... } } - merge
• { action: "delete", agent: "name" }
• Use chainName for chain operations`,
		parameters: SubagentParams,
		execute,
		renderCall(args, theme) {
			if (args.action) {
				const target = args.agent || args.chainName || "";
				return new Text(
					`${theme.fg("toolTitle", theme.bold("subagent "))}${args.action}${target ? ` ${theme.fg("accent", target)}` : ""}`,
					0,
					0,
				);
			}

			const isParallel = (args.tasks?.length ?? 0) > 0;
			const parallelCount = effectiveParallelTaskCount(args.tasks as Array<{ count?: unknown }> | undefined);
			const asyncLabel = args.async === true && !isParallel ? theme.fg("warning", " [async]") : "";
			if (args.chain?.length) return new Text(`${theme.fg("toolTitle", theme.bold("subagent "))}chain (${args.chain.length})${asyncLabel}`, 0, 0);
			if (isParallel) return new Text(`${theme.fg("toolTitle", theme.bold("subagent "))}parallel (${parallelCount})`, 0, 0);
			return new Text(`${theme.fg("toolTitle", theme.bold("subagent "))}${theme.fg("accent", args.agent || "?")}${asyncLabel}`, 0, 0);
		},
		renderResult(result, options, theme) {
			return renderSubagentResult(result, options, theme);
		},
	};
}
