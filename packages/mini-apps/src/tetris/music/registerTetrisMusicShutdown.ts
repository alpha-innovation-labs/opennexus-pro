import { stopTetrisMusicRuntime } from "./tetrisMusicRuntime";

let registered = false;

/** Registers process-exit cleanup for shared Tetris music playback. */
export function registerTetrisMusicShutdown(): void {
	if (registered) return;
	registered = true;
	process.once("exit", stopTetrisMusicRuntime);
	process.once("SIGINT", () => {
		stopTetrisMusicRuntime();
		process.exit(130);
	});
	process.once("SIGTERM", () => {
		stopTetrisMusicRuntime();
		process.exit(143);
	});
}
