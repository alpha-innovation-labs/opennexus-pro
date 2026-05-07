import type { ChildProcess } from "node:child_process";
import { registerTetrisMusicShutdown } from "./registerTetrisMusicShutdown.js";
import { startTetrisMusic } from "./startTetrisMusic.js";
import { stopTetrisMusic } from "./stopTetrisMusic.js";

let musicProcess: ChildProcess | null = null;

/**
 * Returns whether the shared Tetris music process is running.
 *
 * @returns True when music is running.
 */
export function isTetrisMusicRunning(): boolean {
	return musicProcess !== null;
}

/** Starts the shared Tetris music process if needed. */
export function ensureTetrisMusicRunning(): void {
	if (musicProcess) return;
	registerTetrisMusicShutdown();
	musicProcess = startTetrisMusic();
}

/** Stops the shared Tetris music process. */
export function stopTetrisMusicRuntime(): void {
	stopTetrisMusic(musicProcess);
	musicProcess = null;
}
