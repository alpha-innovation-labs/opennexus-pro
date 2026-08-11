const RENDER_SCHEDULER_INSTALLED = Symbol.for(
	"nexus.promptline.renderSchedulerInstalled",
);

interface PromptlineScheduledTui {
	constructor: { MIN_RENDER_INTERVAL_MS?: number };
	requestRender(force?: boolean): void;
	[RENDER_SCHEDULER_INSTALLED]?: boolean;
}

const DEFAULT_FRAME_INTERVAL_MS = 50;

/**
 * Coalesces non-forced promptline render requests to a fixed frame interval.
 *
 * @param tui Active Pi TUI instance.
 * @param frameIntervalMs Minimum interval between non-forced renders.
 */
export function installPromptlineRenderScheduler(
	tui: PromptlineScheduledTui,
	frameIntervalMs = DEFAULT_FRAME_INTERVAL_MS,
): void {
	if (
		typeof tui.constructor.MIN_RENDER_INTERVAL_MS === "number" &&
		tui.constructor.MIN_RENDER_INTERVAL_MS < frameIntervalMs
	) {
		tui.constructor.MIN_RENDER_INTERVAL_MS = frameIntervalMs;
	}
	if (tui[RENDER_SCHEDULER_INSTALLED]) return;

	const requestRenderNow = tui.requestRender.bind(tui);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let nextRenderAt = 0;

	tui.requestRender = (force = false) => {
		if (force) {
			if (timer) clearTimeout(timer);
			timer = undefined;
			nextRenderAt = Date.now() + frameIntervalMs;
			requestRenderNow(true);
			return;
		}

		const now = Date.now();
		if (now >= nextRenderAt) {
			nextRenderAt = now + frameIntervalMs;
			requestRenderNow(false);
			return;
		}

		if (timer) return;
		timer = setTimeout(() => {
			timer = undefined;
			nextRenderAt = Date.now() + frameIntervalMs;
			requestRenderNow(false);
		}, nextRenderAt - now);
	};

	tui[RENDER_SCHEDULER_INSTALLED] = true;
}
