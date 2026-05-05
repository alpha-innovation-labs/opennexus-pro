export interface SmartEvalStatusIndicator {
	setProgress(completed: number, total: number): void;
	stop(): void;
}

interface SmartEvalStatusUi {
	setStatus?: (key: string, message: string | undefined) => void;
	setWidget?: (key: string, content: string[] | undefined, options?: { placement?: "belowEditor" }) => void;
}

/**
 * Starts a lightweight status indicator while background smart-eval work runs.
 *
 * @param ctx UI-capable context subset.
 * @param total Total turns queued for evaluation.
 * @param label Status label shown beside the spinner.
 * @returns Indicator controller.
 */
export function startSmartEvalStatusIndicator(
	ctx: { hasUI?: boolean; ui?: SmartEvalStatusUi },
	total: number,
	label = "prepping evals",
): SmartEvalStatusIndicator {
	if (!ctx.hasUI || (!ctx.ui?.setStatus && !ctx.ui?.setWidget)) return { setProgress() {}, stop() {} };
	const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
	let frameIndex = 0;
	let completed = 0;
	const render = (): void => {
		const message = `${frames[frameIndex]} ${label} ${completed}/${total}`;
		ctx.ui?.setStatus?.("smart-eval", message);
		ctx.ui?.setWidget?.("smart-eval", [message], { placement: "belowEditor" });
		frameIndex = (frameIndex + 1) % frames.length;
	};
	const interval = setInterval(render, 100);
	render();
	return {
		setProgress(nextCompleted: number): void {
			completed = nextCompleted;
			render();
		},
		stop(): void {
			clearInterval(interval);
			ctx.ui?.setStatus?.("smart-eval", undefined);
			ctx.ui?.setWidget?.("smart-eval", undefined);
		},
	};
}
