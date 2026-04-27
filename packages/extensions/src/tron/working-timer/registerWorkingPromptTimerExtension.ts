import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createWorkingPromptTimer } from "./createWorkingPromptTimer.js";
import type { WorkingPromptTimer } from "./types.js";

/**
 * Registers the active-prompt working-message elapsed timer.
 *
 * @param pi Pi extension API.
 */
export default function registerWorkingPromptTimerExtension(pi: ExtensionAPI): void {
	let timer: WorkingPromptTimer | undefined;

	const stopTimer = (): void => {
		timer?.stop();
		timer = undefined;
	};

	pi.on("agent_start", async (_event, ctx) => {
		stopTimer();
		if (!ctx.hasUI) return;
		timer = createWorkingPromptTimer(ctx);
	});

	pi.on("agent_end", async () => {
		stopTimer();
	});

	pi.on("session_shutdown", async () => {
		stopTimer();
	});
}
