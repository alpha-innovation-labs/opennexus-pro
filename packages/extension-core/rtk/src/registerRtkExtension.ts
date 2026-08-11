import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerSavingsCommand } from "./command/registerSavingsCommand";
import { createRtkRuntime } from "./runtime/createRtkRuntime";
import { findAvailableRtkCommand } from "./runtime/findAvailableRtkCommand";
import { getRtkExecutionCwd } from "./runtime/getRtkExecutionCwd";
import { installRtkForUnixLike } from "./runtime/installRtkForUnixLike";
import {
	clearRtkRuntimeForCwd,
	getRtkRuntimeForCwd,
	setRtkRuntimeForCwd,
} from "./runtime/runtimeStore";
import { createRtkBashTool } from "./tooling/createRtkBashTool";
import { createRtkFindTool } from "./tooling/createRtkFindTool";
import { createRtkGrepTool } from "./tooling/createRtkGrepTool";
import { createRtkLsTool } from "./tooling/createRtkLsTool";
import { createRtkReadTool } from "./tooling/createRtkReadTool";
import { showRtkEnvironmentPreparationModal } from "./ui/showRtkEnvironmentPreparationModal";

/**
 * Registers the RTK extension surface.
 *
 * @param pi Pi extension API.
 */
export function registerRtkExtension(pi: ExtensionAPI): void {
	pi.registerTool(createRtkReadTool());
	pi.registerTool(createRtkFindTool());
	pi.registerTool(createRtkLsTool());
	pi.registerTool(createRtkGrepTool());
	pi.registerTool(createRtkBashTool());
	registerSavingsCommand(pi);

	pi.on("session_start", async (_event, ctx) => {
		const cwd = getRtkExecutionCwd(ctx);
		let command = await findAvailableRtkCommand(pi, cwd, ctx?.signal);
		if (!command) {
			const closePreparingModal = showRtkEnvironmentPreparationModal(ctx);
			try {
				await installRtkForUnixLike(pi, cwd, ctx?.signal);
				command = await findAvailableRtkCommand(pi, cwd, ctx?.signal);
			} finally {
				closePreparingModal();
			}
		}

		if (!command) {
			clearRtkRuntimeForCwd(cwd);
			console.warn(
				"[rtk] rtk binary unavailable — extension falls back to base tools",
			);
			return;
		}

		setRtkRuntimeForCwd(cwd, createRtkRuntime(pi, command));
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		clearRtkRuntimeForCwd(getRtkExecutionCwd(ctx));
	});

	pi.on("tool_call", async (event, ctx) => {
		const toolName = String(
			(event as { toolName?: unknown }).toolName ?? "",
		).toLowerCase();
		if (toolName !== "bash" && toolName !== "shell") {
			return;
		}

		const input = (event as { input?: { command?: unknown } }).input;
		if (!input || typeof input.command !== "string" || !input.command) {
			return;
		}

		const runtime = getRtkRuntimeForCwd(getRtkExecutionCwd(ctx));
		if (!runtime) {
			return;
		}

		try {
			const command = input.command;
			const result = await runtime.exec("rewrite", [command], {
				cwd: getRtkExecutionCwd(ctx),
				signal: ctx.signal,
			});
			const rewritten = result.stdout.trim();
			if (rewritten && rewritten !== command) {
				input.command = rewritten;
			}
		} catch {
			// RTK rewrite failed — let the original command run unchanged.
		}
	});
}
