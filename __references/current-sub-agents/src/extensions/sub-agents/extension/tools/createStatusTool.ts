import * as fs from "node:fs";
import * as path from "node:path";
import type { ToolDefinition } from "@mariozechner/pi-coding-agent";
import { formatAsyncRunList, listAsyncRuns } from "../../vendor/async-status.js";
import { StatusParams } from "../../vendor/schemas.js";
import { findByPrefix, readStatus } from "../../vendor/utils.js";
import { ASYNC_DIR, RESULTS_DIR, type Details } from "../../vendor/types.js";
import { createErrorResult } from "./createErrorResult.js";

/**
 * Creates the async status inspection tool.
 *
 * @returns The configured `subagent_status` tool definition.
 */
export function createStatusTool(): ToolDefinition<typeof StatusParams, Details> {
	return {
		name: "subagent_status",
		label: "Subagent Status",
		description: "Inspect async subagent run status and artifacts",
		parameters: StatusParams,
		async execute(_id, params) {
			if (params.action === "list") {
				try {
					const runs = listAsyncRuns(ASYNC_DIR, { states: ["queued", "running"] });
					return {
						content: [{ type: "text", text: formatAsyncRunList(runs) }],
						details: { mode: "single", results: [] } as const,
					};
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error);
					return createErrorResult(message);
				}
			}

			let asyncDir: string | null = null;
			let resolvedId = params.id;
			if (params.dir) asyncDir = path.resolve(params.dir);
			else if (params.id) {
				const direct = path.join(ASYNC_DIR, params.id);
				if (fs.existsSync(direct)) asyncDir = direct;
				else {
					const match = findByPrefix(ASYNC_DIR, params.id);
					if (match) {
						asyncDir = match;
						resolvedId = path.basename(match);
					}
				}
			}

			const resultPath = params.id && !asyncDir ? findByPrefix(RESULTS_DIR, params.id, ".json") : null;
			if (!asyncDir && !resultPath) return createErrorResult("Async run not found. Provide id or dir.");

			if (asyncDir) {
				try {
					const status = readStatus(asyncDir);
					if (status) {
						const logPath = path.join(asyncDir, `subagent-log-${resolvedId ?? "unknown"}.md`);
						const eventsPath = path.join(asyncDir, "events.jsonl");
						const stepsTotal = status.steps?.length ?? 1;
						const current = status.currentStep !== undefined ? status.currentStep + 1 : undefined;
						const lines = [
							`Run: ${status.runId}`,
							`State: ${status.state}`,
							`Mode: ${status.mode}`,
							current !== undefined ? `Step: ${current}/${stepsTotal}` : `Steps: ${stepsTotal}`,
							`Started: ${new Date(status.startedAt).toISOString()}`,
							`Updated: ${status.lastUpdate ? new Date(status.lastUpdate).toISOString() : "n/a"}`,
							`Dir: ${asyncDir}`,
						];
						if (status.sessionFile) lines.push(`Session: ${status.sessionFile}`);
						if (fs.existsSync(logPath)) lines.push(`Log: ${logPath}`);
						if (fs.existsSync(eventsPath)) lines.push(`Events: ${eventsPath}`);
						return { content: [{ type: "text", text: lines.join("\n") }], details: { mode: "single", results: [] } as const };
					}
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error);
					return createErrorResult(message);
				}
			}

			if (resultPath) {
				try {
					const raw = fs.readFileSync(resultPath, "utf-8");
					const data = JSON.parse(raw) as { id?: string; success?: boolean; summary?: string };
					const lines = [`Run: ${data.id ?? params.id}`, `State: ${data.success ? "complete" : "failed"}`, `Result: ${resultPath}`];
					if (data.summary) lines.push("", data.summary);
					return { content: [{ type: "text", text: lines.join("\n") }], details: { mode: "single", results: [] } as const };
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error);
					return createErrorResult(`Failed to read async result file: ${message}`);
				}
			}

			return createErrorResult("Status file not found.");
		},
	};
}
