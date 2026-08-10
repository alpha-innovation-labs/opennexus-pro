import { formatWorkingPromptMessage } from "./formatWorkingPromptMessage";
import type { WorkingPromptTimer, WorkingPromptTimerContext } from "./types";

/**
 * Starts a UI working-message timer for one active prompt.
 *
 * @param ctx Extension context with UI working-message access.
 * @param startedAt Prompt start timestamp in milliseconds.
 * @param intervalMs Refresh interval in milliseconds.
 * @param now Supplies the current timestamp for rendering.
 * @returns Timer controller that stops updates and restores the default message.
 */
export function createWorkingPromptTimer(
	ctx: WorkingPromptTimerContext,
	startedAt = Date.now(),
	intervalMs = 1000,
	now = (): number => Date.now(),
): WorkingPromptTimer {
	const render = (): void => {
		if (ctx.hasUI) ctx.ui.setWorkingMessage(formatWorkingPromptMessage(startedAt, now()));
	};

	render();
	const interval = setInterval(render, intervalMs);

	return {
		stop(): void {
			clearInterval(interval);
			if (ctx.hasUI) ctx.ui.setWorkingMessage();
		},
	};
}
